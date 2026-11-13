r"""Download DKW's public pages and media, then import them into the local clone.

Run from the user's PowerShell (Python standard library only):
  python .\scripts\capture-dkw-site.py
Nothing is submitted to the source site. TLS verification remains enabled.
"""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote, quote
from urllib.request import Request, urlopen
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://dkwplastics.com'
EVIDENCE = ROOT / 'docs/research/dkwplastics/fullsite'
MEDIA = ROOT / 'public/sites/dkwplastics/fullsite'
SLUGS = [
    '', 'shop', 'contact-us', 'blog',
    'the-evolution-of-reusable-ziplock-bags',
    'how-to-recycle-ldpe-essential-guide-for-businesses',
    'a-deep-dive-into-dkw-plastic-recycling',
    'role-of-food-safe-packaging-in-the-food-industry',
    'exploring-uses-of-plastic-packaging',
    'how-use-food-grade-packaging-for-wijaya-products',
    '5-essential-commercial-uses-of-resealable-ziplock-bags',
    'a-comprehensive-guide-to-food-grade-packaging',
]

def fetch(url):
    # urllib's HTTP request line must be ASCII; source filenames can contain Unicode.
    encoded_url = quote(url, safe=":/?&=#%+;,@!$'()*[]~")
    request = Request(encoded_url, headers={'User-Agent': 'Mozilla/5.0 (compatible; DKWLocalSiteCapture/1.0)'})
    with urlopen(request, timeout=25) as response:
        return response.read(), response.headers.get_content_type()

class Assets(HTMLParser):
    def __init__(self, base):
        super().__init__()
        self.base, self.urls = base, set()

    def add(self, value, image=False):
        url = urljoin(self.base, value.strip(' \"\''))
        parsed = urlparse(url)
        if image and parsed.scheme == 'https' and (parsed.hostname or '').endswith('.googleusercontent.com'):
            self.urls.add(url.split('#')[0])
        elif parsed.scheme == 'https' and parsed.hostname in ('dkwplastics.com', 'www.dkwplastics.com'):
            if re.search(r'\.(?:png|jpe?g|webp|gif|svg|avif|woff2?|css)(?:\?|$)', url, re.I):
                self.urls.add(url.split('#')[0])

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('img', 'source', 'video'):
            for key in ('src', 'data-src', 'poster'):
                if attrs.get(key): self.add(attrs[key], image=True)
            for key in ('srcset', 'data-srcset'):
                for item in attrs.get(key, '').split(','):
                    if item.strip(): self.add(item.strip().split()[0], image=True)
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            self.add(attrs.get('href', ''))
        for value in re.findall(r'url\(([^)]+)\)', attrs.get('style', '')):
            self.add(value)

def main():
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    MEDIA.mkdir(parents=True, exist_ok=True)
    retry_only = '--retry-assets' in sys.argv
    manifest_path = EVIDENCE / 'manifest.json'
    if retry_only and not manifest_path.exists():
        print('Run the initial capture before retrying assets.')
        return 1
    manifest = json.loads(manifest_path.read_text(encoding='utf8')) if retry_only else {'pages': [], 'assets': {}, 'errors': []}
    asset_urls = {url for url, asset in manifest['assets'].items() if 'error' in asset} if retry_only else set()
    if retry_only:
        # Earlier captures excluded externally hosted article images. Discover those
        # from already-saved source pages without downloading the pages again.
        for page in manifest['pages']:
            parser = Assets(page['url'])
            parser.feed((EVIDENCE / page['file']).read_text(encoding='utf8'))
            asset_urls.update(parser.urls)
    for slug in ([] if retry_only else SLUGS):
        url = ORIGIN + '/' + (slug + '/' if slug else '')
        try:
            body, kind = fetch(url)
            if kind != 'text/html': raise ValueError('Expected HTML, received ' + kind)
            text = body.decode('utf-8', errors='replace')
            if re.search(r'<title>[^<]*(?:Page Not Found|404)', text, re.I):
                raise ValueError('Source returned a not-found page')
            filename = (slug or 'home') + '.html'
            (EVIDENCE / filename).write_text(text, encoding='utf8')
            manifest['pages'].append({'url': url, 'slug': slug, 'file': filename})
            parser = Assets(url)
            parser.feed(text)
            for value in re.findall(r'url\(([^)]+)\)', text): parser.add(value)
            asset_urls.update(parser.urls)
            print('Saved page:', url, flush=True)
        except Exception as error:
            manifest['errors'].append({'url': url, 'error': str(error)})
            print('Could not save:', url, error, flush=True)

    def download(url):
        try:
            body, kind = fetch(url)
            if kind == 'text/html': raise ValueError('An asset URL returned HTML')
            name = re.sub(r'[^a-zA-Z0-9._-]', '-', unquote(Path(urlparse(url).path).name))
            original_suffix = Path(name).suffix
            suffix = {'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg', 'image/avif': '.avif'}.get(kind, original_suffix)
            # Keep paths below Windows' legacy path limit; the hash preserves identity.
            filename = sha256(url.encode()).hexdigest()[:10] + '-' + name.removesuffix(original_suffix)[:90] + suffix
            (MEDIA / filename).write_bytes(body)
            nested = set()
            if kind == 'text/css' or filename.endswith('.css'):
                parser = Assets(url)
                for value in re.findall(r'url\(([^)]+)\)', body.decode('utf8', errors='replace')): parser.add(value)
                nested = parser.urls
            return url, {'local': '/sites/dkwplastics/fullsite/' + filename, 'type': kind, 'bytes': len(body)}, nested
        except Exception as error:
            return url, {'error': str(error)}, set()

    # Two waves include media referenced by the source stylesheets.
    for wave in range(2):
        saved = {url for url, asset in manifest['assets'].items() if 'local' in asset}
        pending = sorted(asset_urls - saved)
        with ThreadPoolExecutor(max_workers=6) as pool:
            for url, result, nested in pool.map(download, pending):
                manifest['assets'][url] = result
                asset_urls.update(nested)
        print('Captured media files:', sum('local' in value for value in manifest['assets'].values()), flush=True)
    (EVIDENCE / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
    if not manifest['pages']:
        print('No pages downloaded. Check your Internet connection. Existing clone was not changed.')
        return 1
    imported = subprocess.run([sys.executable, str(ROOT / 'scripts/import-dkw-site.py')], cwd=ROOT)
    print('Capture report:', EVIDENCE / 'manifest.json')
    if manifest['errors']: print('Some pages could not be downloaded; see the report above.')
    return imported.returncode

if __name__ == '__main__':
    raise SystemExit(main())
