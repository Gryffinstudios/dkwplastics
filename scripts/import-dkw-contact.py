"""Read contact-field content from the captured source without running its scripts."""
from html.parser import HTMLParser
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/research/dkwplastics/fullsite/contact-us.html'
OUTPUT = ROOT / 'src/components/sites/dkwplastics/contact-source.json'

class ContactParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_form = False
        self.in_label = False
        self.in_option = False
        self.label = ''
        self.option = ''
        self.fields = []
        self.options = []
        self.description_limit = 180

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'form':
            self.in_form = attrs.get('id') == 'forminator-module-391'
        if not self.in_form:
            return
        if tag == 'label':
            self.in_label, self.label = True, ''
        if tag == 'input' and attrs.get('type') not in ('hidden', 'submit'):
            self.fields.append({
                'sourceName': attrs.get('name', ''),
                'label': self.label.strip().rstrip('*').strip(),
                'placeholder': attrs.get('placeholder', ''),
                'required': attrs.get('aria-required') == 'true',
            })
        if tag == 'option':
            self.in_option, self.option = True, ''
        if tag == 'textarea':
            self.description_limit = int(attrs.get('maxlength', 180))

    def handle_endtag(self, tag):
        if tag == 'form':
            self.in_form = False
        if tag == 'label':
            self.in_label = False
        if tag == 'option' and self.in_option:
            self.options.append(self.option.strip().replace('\u200b', ''))
            self.in_option = False

    def handle_data(self, value):
        if self.in_form and self.in_label:
            self.label += value
        if self.in_form and self.in_option:
            self.option += value

parser = ContactParser()
parser.feed(SOURCE.read_text(encoding='utf8'))
if len(parser.fields) != 4 or not parser.options:
    raise ValueError('Expected captured contact form 391 with four personal fields and product options.')
record = {
    'source': 'https://dkwplastics.com/contact-us/',
    'sourceForm': 'forminator-module-391',
    'fields': parser.fields,
    'products': parser.options,
    'descriptionLimit': parser.description_limit,
    'submitLabel': 'Request Quote',
    'layout': {
        'nameColumns': 2,
        'emailColumns': 1,
        'phoneColumns': 1,
        'contentMaxWidthPx': 1140,
        'formPaddingBlockPx': 80,
        'rowGapPx': 30,
        'headerMinHeightDesktop': '39vh',
        'headerMinHeightMobile': '16vh',
    },
    'submission': 'Local email draft; captured WordPress form endpoints and nonces are not reused.',
}
OUTPUT.write_text(json.dumps(record, indent=2, ensure_ascii=False) + '\n', encoding='utf8')
print(f'Imported {len(parser.fields)} fields, {len(parser.options)} product options, and {parser.description_limit}-character limit.')
