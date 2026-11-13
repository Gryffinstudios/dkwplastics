"""Import captured source article content without executing WordPress scripts."""
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
import json
import re

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / 'docs/research/dkwplastics/fullsite'
POSTS = ROOT / 'src/components/sites/dkwplastics/posts.json'
ALLOWED = {'p', 'h2', 'h3', 'h4', 'h5', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'a', 'img', 'br', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'figure', 'figcaption', 'sup', 'sub'}
SKIP = {'script', 'style', 'form', 'iframe', 'nav', 'header', 'footer', 'button'}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node): yield from child.walk()

    def text(self):
        return re.sub(r'\s+', ' ', ' '.join(child.text() if isinstance(child, Node) else child for child in self.children)).strip()

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.root = Node()
        self.current = self.root

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.current)
        self.current.children.append(node)
        if tag not in VOID: self.current = node

    def handle_endtag(self, tag):
        node = self.current
        while node.parent:
            if node.tag == tag:
                self.current = node.parent
                break
            node = node.parent

    def handle_data(self, value): self.current.children.append(value)

def main():
    if not (FOLDER / 'manifest.json').exists():
        print('Capture source pages first: python scripts/capture-dkw-site.py')
        return 1
    manifest = json.loads((FOLDER / 'manifest.json').read_text(encoding='utf8'))
    assets = manifest['assets']
    posts = json.loads(POSTS.read_text(encoding='utf8'))
    local_routes = {post['slug'] for post in posts} | {'', 'shop', 'contact-us', 'blog'}

    def local_url(value, base):
        url = urljoin(base, value)
        if url in assets and 'local' in assets[url]: return assets[url]['local']
        parsed = urlparse(url)
        if parsed.scheme not in ('https', 'http', 'mailto', 'tel'): return ''
        if parsed.hostname in ('dkwplastics.com', 'www.dkwplastics.com') and parsed.path.strip('/') in local_routes:
            return parsed.path + ('?' + parsed.query if parsed.query else '') + ('#' + parsed.fragment if parsed.fragment else '')
        return url

    def serialize(node, base):
        if isinstance(node, str): return escape(node)
        if node.tag in SKIP: return ''
        children = ''.join(serialize(child, base) for child in node.children)
        if node.tag not in ALLOWED: return children
        attrs = ''
        if node.tag == 'a':
            href = local_url(node.attrs.get('href', ''), base)
            if not href: return children
            attrs = ' href="' + escape(href, quote=True) + '"'
            if {'elementor-button', 'wp-block-button__link'} & set(node.attrs.get('class', '').split()):
                attrs += ' class="article-cta"'
        if node.tag == 'img':
            value = node.attrs.get('data-src') or node.attrs.get('src', '')
            if value.startswith('data:'): return ''
            src = local_url(value, base)
            if not src: return ''
            attrs = ' src="' + escape(src, quote=True) + '" alt="' + escape(node.attrs.get('alt', ''), quote=True) + '" loading="lazy"'
        if node.tag in ('th', 'td'):
            for key in ('colspan', 'rowspan'):
                if node.attrs.get(key, '').isdigit(): attrs += ' ' + key + '="' + node.attrs[key] + '"'
        return '<' + node.tag + attrs + '>' + children + ('' if node.tag in VOID else '</' + node.tag + '>')

    results = []
    blog_page = next((page for page in manifest['pages'] if page['slug'] == 'blog'), None)
    if blog_page:
        listing = Parser()
        listing.feed((FOLDER / blog_page['file']).read_text(encoding='utf8'))
        for article in listing.root.walk():
            if article.tag != 'article': continue
            nodes = list(article.walk())
            title = next((node for node in nodes if 'post-title' in node.attrs.get('class', '').split()), None)
            if title is None: continue
            slug = urlparse(title.attrs.get('href', '')).path.strip('/')
            post = next((post for post in posts if post['slug'] == slug), None)
            if post is None: continue
            excerpt = next((node for node in nodes if 'short-description' in node.attrs.get('class', '').split()), None)
            if excerpt is not None: post['summary'] = excerpt.text()
            post['title'] = title.text()
            image = next((node for node in nodes if node.tag == 'img'), None)
            if image is not None:
                original_image = image.attrs.get('data-src') or image.attrs.get('src', '')
                mapped = assets.get(original_image, {})
                if mapped.get('local'): post['image'] = mapped['local']
    for post in posts:
        page = next((page for page in manifest['pages'] if page['slug'] == post['slug']), None)
        image = assets.get(post['image'], {})
        if image.get('local'): post['image'] = image['local']
        if not page:
            results.append({'slug': post['slug'], 'status': 'source missing'})
            continue
        parser = Parser()
        parser.feed((FOLDER / page['file']).read_text(encoding='utf8'))
        nodes = list(parser.root.walk())
        containers = [node for node in nodes if 'theme-post-content' in node.attrs.get('data-widget_type', '') or 'elementor-widget-theme-post-content' in node.attrs.get('class', '') or 'entry-content' in node.attrs.get('class', '').split()]
        containers.sort(key=lambda node: len(node.text()))
        body = next((node for node in containers if len(node.text()) > 300), None)
        if body:
            markup = serialize(body, page['url'])
            if len(re.sub('<[^>]*>', '', markup).strip()) > 300:
                post['contentHtml'] = markup
                results.append({'slug': post['slug'], 'status': 'imported', 'characters': len(markup)})
                continue
        # Never substitute navigation, related posts, or an error page as article text.
        results.append({'slug': post['slug'], 'status': 'article container requires inspection'})
    POSTS.write_text(json.dumps(posts, indent=2, ensure_ascii=False), encoding='utf8')
    (FOLDER / 'import-report.json').write_text(json.dumps(results, indent=2), encoding='utf8')
    print(json.dumps(results, indent=2))
    return 0 if all(result['status'] == 'imported' for result in results) else 2

if __name__ == '__main__':
    raise SystemExit(main())
