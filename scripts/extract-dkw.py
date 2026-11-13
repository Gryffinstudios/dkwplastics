"""Extract content and original visual assets from the user's Chrome page save."""
from html.parser import HTMLParser
from html import escape
from pathlib import Path
import json
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = next(ROOT.parent.glob('*.html'))
ASSETS = next(ROOT.parent.glob('*_files'))
DEST = ROOT / 'public/sites/dkwplastics'
DEST.mkdir(parents=True, exist_ok=True)

class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()

    def text(self):
        return re.sub(r'\s+', ' ', ' '.join(c.text() if isinstance(c, Node) else c for c in self.children)).strip()

    def html(self, svg=False):
        if not svg and self.tag not in ('p', 'ul', 'li', 'strong', 'b', 'em', 'br'):
            return ''.join(c.html(svg) if isinstance(c, Node) else escape(c) for c in self.children)
        attrs = ''.join(' ' + ('viewBox' if k == 'viewbox' else k) + '="' + escape(v or '', quote=True) + '"' for k, v in self.attrs.items()) if svg else ''
        body = ''.join(c.html(svg) if isinstance(c, Node) else escape(c) for c in self.children)
        return '<' + self.tag + attrs + '>' + body + ('' if self.tag == 'br' else '</' + self.tag + '>')

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.root = Node()
        self.current = self.root

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.current)
        self.current.children.append(n)
        if tag not in ('area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'):
            self.current = n

    def handle_endtag(self, tag):
        n = self.current
        while n.parent:
            if n.tag == tag:
                self.current = n.parent
                break
            n = n.parent

    def handle_data(self, data):
        self.current.children.append(data)

p = Parser()
p.feed(SOURCE.read_text(encoding='utf8'))
nodes = list(p.root.walk())
widgets = {n.attrs['data-id']: n for n in nodes if 'data-widget_type' in n.attrs}

mapping = []
for f in ASSETS.iterdir():
    if f.suffix.lower() in ('.png', '.jpeg', '.jpg', '.webp', '.woff', '.woff2'):
        shutil.copy2(f, DEST / f.name)
        mapping.append({'saved': f.name, 'local': '/sites/dkwplastics/' + f.name})

# SVG attribute names are case-sensitive; preserve the original markup.
raw = SOURCE.read_text(encoding='utf8')
logo_section = raw[raw.index('data-id="d5a6daf"'):]
logo = re.search(r'<svg\b.*?</svg>', logo_section, re.S)[0]
(DEST / 'dkw-logo.svg').write_text(logo, encoding='utf8')

def text(id): return widgets[id].text()
def image(id):
    n = next(n for n in widgets[id].walk() if n.tag == 'img')
    return {'src': '/sites/dkwplastics/' + n.attrs['src'].split('/')[-1], 'alt': n.attrs.get('alt', '')}

products = []
for img, title, body, anchor in [
    ('db54574','1570d9a','209efe3','01'), ('4794866','30f56a9','acafe0e','02'),
    ('cdc85e4','0b73c97','ae7718d','03'), ('23026e2','1420250','c092fbe','04'),
    ('2c39f0d','980c487','9e01925','05'), ('d251b6a','fb87c21','420a0ad','07'),
    ('dfb7ce5','47a955f','f68d9ed','08'), ('6ed8faf','f9f3c64','e66550e','06')]:
    products.append({'title': text(title), 'image': image(img), 'body': widgets[body].html(), 'href': 'https://dkwplastics.com/shop#' + anchor})

reviews = []
for n in widgets['20fec20'].walk():
    if 'elementor-testimonial__content' in n.attrs.get('class', ''):
        parent = n.parent
        def part(cls):
            return next((x.text() for x in parent.walk() if cls in x.attrs.get('class', '')), '')
        name = part('elementor-testimonial__name')
        if name and name not in [r['name'] for r in reviews]:
            img = next(x for x in parent.walk() if x.tag == 'img')
            reviews.append({'name': name, 'text': part('elementor-testimonial__text'), 'image': '/sites/dkwplastics/' + img.attrs['src'].split('/')[-1]})

reviews.sort(key=lambda review: next((index for index, name in enumerate(['Sri Lankan', 'House of Fashion', 'Wijeya', 'Lalan']) if review['name'].startswith(name)), 4))
data = {'products': products, 'reviews': reviews,
    'clients': [image(i) for i in ['ddd7e94','2ee60ca','68b82b3','3c8000f','0dab06b','3c2d961']],
    'clientIntro': text('4863cee'), 'productIntro': text('8b67814'), 'servicesIntro': text('5d9359c'),
    'globalIntro': text('196d9b2'), 'customIntro': text('d81d8f2')}
out = ROOT / 'src/components/sites/dkwplastics'
out.mkdir(parents=True, exist_ok=True)
(out / 'content.json').write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf8')
research = ROOT / 'docs/research/dkwplastics'
(research / 'asset-map.json').write_text(json.dumps(mapping, indent=2), encoding='utf8')

# Prefer the downloaded original font. Keep the source URL as a fallback for re-extraction.
fonts = []
for f in ASSETS.glob('css*'):
    raw = f.read_text(encoding='utf8')
    for block in re.findall(r'/\* latin \*/\s*(@font-face\s*\{[^}]+\})', raw):
        if any("'" + family + "'" in block for family in ['Lexend', 'Lexend Deca', 'Lexend Exa', 'Red Hat Display', 'Hepta Slab']):
            if block not in fonts: fonts.append(block)
font_url = '/sites/dkwplastics/red-hat-display-latin.woff2' if (DEST / 'red-hat-display-latin.woff2').exists() else 'https://fonts.gstatic.com/s/redhatdisplay/v21/8vIQ7wUr0m80wwYf0QCXZzYzUoTg_T6h.woff2'
(out / 'fonts.css').write_text('@font-face { font-family: "Red Hat Display"; font-style: normal; font-weight: 300 900; font-display: swap; src: url("' + font_url + '") format("woff2"); }\n', encoding='utf8')
mapping.extend([
    {'source': 'https://fonts.gstatic.com/s/redhatdisplay/v21/8vIQ7wUr0m80wwYf0QCXZzYzUoTg_T6h.woff2', 'local': '/sites/dkwplastics/red-hat-display-latin.woff2'},
    {'source': 'https://dkwplastics.com/wp-content/uploads/2023/12/mage-from-rawpixel-id-896813-jpeg.jpg', 'local': '/sites/dkwplastics/hero-background.jpg'},
    {'source': 'Inline source SVG, widget d5a6daf', 'local': '/sites/dkwplastics/dkw-logo.svg'},
])
(research / 'asset-map.json').write_text(json.dumps(mapping, indent=2), encoding='utf8')
print(f'Extracted {len(products)} products, {len(reviews)} reviews, {len(mapping)} assets, {len(fonts)} font declarations.')
