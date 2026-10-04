"""Check the server-delivered HTML, link graph, metadata, schema, and image files."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote, urljoin
import json
import xml.etree.ElementTree as ET

ORIGIN = 'https://' + Path('CNAME').read_text().strip()
class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.tags = []; self.ids = set(); self.schemas = []; self.schema = None; self.text = []
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs); self.tags.append((tag, attrs))
        if 'id' in attrs: self.ids.add(attrs['id'])
        if tag == 'script' and attrs.get('type') == 'application/ld+json': self.schema = ''
    def handle_data(self, data):
        if self.schema is not None: self.schema += data
        else: self.text.append(data)
    def handle_endtag(self, tag):
        if tag == 'script' and self.schema is not None:
            self.schemas.append(json.loads(self.schema)); self.schema = None

pages = {('/' if file.name == 'index.html' else '/' + file.name): Page(file.read_text()) for file in Path('.').glob('*.html')}
canonicals = set(); graph = {path:set() for path in pages}; descriptions = set()
for path, page in pages.items():
    assert sum(tag == 'h1' for tag, attrs in page.tags) == 1, f'{path}: expected one H1'
    canonical = [a['href'] for t,a in page.tags if t == 'link' and a.get('rel') == 'canonical']
    assert canonical == [ORIGIN + path], f'{path}: incorrect canonical {canonical}'
    if path not in ['/404.html','/success.html']: canonicals.add(canonical[0])
    description = [a['content'] for t,a in page.tags if t == 'meta' and a.get('name') == 'description']
    assert len(description) == 1 and 60 <= len(description[0]) <= 170, f'{path}: missing/invalid description'
    assert description[0] not in descriptions, f'{path}: duplicate description'
    descriptions.add(description[0])
    for tag, attrs in page.tags:
        assert not (tag == 'meta' and attrs.get('name','').lower() in ['robots','googlebot'] and 'noindex' in attrs.get('content','').lower()), f'{path}: noindex'
        assert not (tag == 'meta' and attrs.get('http-equiv','').lower() == 'refresh'), f'{path}: redirect'
        if tag == 'img':
            assert attrs.get('alt','').strip(), f'{path}: missing image alt'
            assert int(attrs.get('width','0')) > 0 and int(attrs.get('height','0')) > 0, f'{path}: image space not reserved'
        references = [attrs.get(k) for k in ['href','src','data-src','data-ar-image'] if attrs.get(k)]
        if 'srcset' in attrs: references += [candidate.strip().split()[0] for candidate in attrs['srcset'].split(',')]
        for ref in references:
            url = urlsplit(urljoin(ORIGIN + path, ref))
            if url.scheme and url.scheme not in ['http','https']: continue
            if url.netloc and url.netloc != urlsplit(ORIGIN).netloc: continue
            target = unquote(url.path) or path
            if target == '/index.html': target = '/'
            local = Path('index.html' if target == '/' else target.lstrip('/'))
            assert local.is_file(), f'{path}: broken reference {ref}'
            if target in pages and tag == 'a': graph[path].add(target)
            if url.fragment and local.suffix == '.html':
                target_page = pages.get(target)
                assert target_page and url.fragment in target_page.ids, f'{path}: broken anchor {ref}'
    for obj in page.schemas:
        assert obj.get('@context') == 'https://schema.org', f'{path}: invalid schema context'
        if obj.get('@type') == 'FAQPage':
            html = ''.join(page.text)
            for q in obj['mainEntity']:
                assert q['name'] in html and q['acceptedAnswer']['text'] in html, 'FAQ schema must match visible answers'
        if obj.get('@type') == 'BreadcrumbList':
            assert [item['position'] for item in obj['itemListElement']] == [1,2]
visited = set(); pending = ['/']
while pending:
    path = pending.pop()
    if path in visited: continue
    visited.add(path); pending.extend(graph[path] - visited)
# The purchase-confirmation utility is reached through checkout, not navigation.
assert {'/', '/ar.html'} <= visited, 'A public experience page is orphaned'
sitemap = ET.parse('sitemap.xml').getroot()
urls = [loc.text for loc in sitemap.findall('{*}url/{*}loc')]
assert set(urls) == canonicals and len(urls) == len(canonicals), 'Sitemap must list exactly the indexable canonical pages'
robots = Path('robots.txt').read_text()
assert 'User-agent: *\nAllow: /' in robots and 'Disallow:' not in robots
assert 'Sitemap: ' + ORIGIN + '/sitemap.xml' in robots
manifest = json.loads(Path('images/manifest.json').read_text())
for source, item in manifest.items():
    for key in ['src']:
        data = Path(item[key]).read_bytes()
        assert data[:4] == b'RIFF' and data[8:12] == b'WEBP', 'Invalid WebP: ' + item[key]
print(f'SEO checks passed: {len(pages)} pages, {len(urls)} sitemap URLs, no broken local links or orphan pages, {len(manifest)} WebP image sets.')
