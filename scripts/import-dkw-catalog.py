"""Import the captured shop as structured data and sanitized description markup."""
from html import escape
from pathlib import Path
from urllib.parse import urljoin
import importlib.util
import json
import re

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / 'docs/research/dkwplastics/fullsite'
OUTPUT = ROOT / 'src/components/sites/dkwplastics/catalog-source.json'
BASE = 'https://dkwplastics.com/shop/'

# The shared importer contains only a parser at module load; its main is guarded.
spec = importlib.util.spec_from_file_location('dkw_source_import', ROOT / 'scripts/import-dkw-site.py')
source_import = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source_import)
Node = source_import.Node


def has_class(node, value):
    return value in node.attrs.get('class', '').split()


def safe_html(node):
    if isinstance(node, str):
        return escape(node)
    if node.tag in {'script', 'style', 'iframe', 'form', 'button'}:
        return ''
    children = ''.join(safe_html(child) for child in node.children)
    if node.tag not in {'p', 'br', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'sup', 'sub'}:
        return children
    return '<' + node.tag + '>' + children + ('' if node.tag == 'br' else '</' + node.tag + '>')


def main():
    manifest = json.loads((FOLDER / 'manifest.json').read_text(encoding='utf8'))
    assets = manifest['assets']
    parser = source_import.Parser()
    parser.feed((FOLDER / 'shop.html').read_text(encoding='utf8'))
    nodes = list(parser.root.walk())
    widgets = {node.attrs.get('data-id'): node for node in nodes if node.attrs.get('data-widget_type')}
    categories = []
    missing = []
    short_names = {
        '01': 'Ziplock Bags', '02': 'Food Packaging', '03': 'Retail Bags', '04': 'Agriculture',
        '05': 'Garment Packaging', '06': 'Household Items', '07': 'Polythene Reels', '08': 'Gusset Bags',
    }
    for category_id in short_names:
        section = next(node for node in nodes if node.attrs.get('id') == category_id)
        section_widgets = [node for node in section.walk() if node.attrs.get('data-widget_type')]
        title = next(node for node in section_widgets if node.attrs.get('data-widget_type') == 'heading.default').text()
        description = next(node for node in section_widgets if node.attrs.get('data-widget_type') == 'text-editor.default')
        photo_widget = next(node for node in section_widgets if node.attrs.get('data-widget_type') == 'the7_photo-scroller.default')
        gallery = []
        for figure in photo_widget.walk():
            if figure.tag != 'figure':
                continue
            image = next((node for node in figure.walk() if node.tag == 'img'), None)
            if image is None:
                continue
            image_url = urljoin(BASE, (image.attrs.get('data-src') or image.attrs.get('src', '')).strip())
            local = assets.get(image_url, {}).get('local')
            if not local:
                missing.append(image_url)
                continue
            caption = next((node.text() for node in figure.walk() if has_class(node, 'entry-title')), image.attrs.get('title', ''))
            gallery.append({
                'src': local,
                'source': image_url,
                'alt': image.attrs.get('alt', ''),
                'caption': caption,
                'width': int(image.attrs.get('width', '0')),
                'height': int(image.attrs.get('height', '0')),
            })

        tabs_widget = next(node for node in section_widgets if node.attrs.get('data-widget_type') == 'tabs.default')
        tab_labels = [node for node in tabs_widget.walk() if has_class(node, 'elementor-tab-desktop-title')]
        panels = {node.attrs.get('data-tab'): node for node in tabs_widget.walk() if node.attrs.get('role') == 'tabpanel'}
        variants = []
        for tab in tab_labels:
            panel = panels[tab.attrs['data-tab']]
            table = next(node for node in panel.walk() if node.tag == 'table')
            rows = []
            for row in table.walk():
                if row.tag != 'tr':
                    continue
                cells = [node for node in row.children if isinstance(node, Node) and node.tag == 'td']
                if len(cells) < 2:
                    continue
                rows.append({'title': cells[0].text(), 'value': cells[1].text(), 'valueHtml': safe_html(cells[1]).strip()})
            variants.append({'name': tab.text(), 'specifications': rows})

        inquiry = next((node for node in section_widgets if node.attrs.get('data-widget_type') == 'button.default'), None)
        categories.append({
            'id': category_id, 'title': title, 'shortName': short_names[category_id],
            'description': safe_html(description).strip(), 'gallery': gallery,
            'variants': variants, 'inquiryLabel': inquiry.text() if inquiry else 'Inquire Now >>>',
        })

    if missing:
        raise RuntimeError('Captured shop gallery assets missing from manifest: ' + ', '.join(missing))
    if len(categories) != 8 or any(not category['gallery'] or not category['variants'] for category in categories):
        raise RuntimeError('Shop source did not contain the expected complete catalog')
    result = {
        'source': BASE, 'title': widgets['e520484'].text(), 'intro': widgets['306e933'].text(),
        'categories': categories,
    }
    OUTPUT.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding='utf8')
    print(json.dumps({
        'categories': len(categories),
        'galleryImages': sum(len(category['gallery']) for category in categories),
        'variants': sum(len(category['variants']) for category in categories),
        'tableRows': sum(len(variant['specifications']) for category in categories for variant in category['variants']),
    }, indent=2))


if __name__ == '__main__':
    main()
