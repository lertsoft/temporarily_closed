import { readdir, readFile, writeFile } from 'node:fs/promises';
const origin = `https://${(await readFile('CNAME', 'utf8')).trim()}`;
// Error and post-checkout utility pages are not search landing pages.
const pages = (await readdir('.')).filter(file => file.endsWith('.html') && !['404.html', 'success.html'].includes(file)).sort();
const urls = [];
for (const page of pages) {
    const html = await readFile(page, 'utf8');
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    if (!canonical || !canonical.startsWith(origin + '/')) throw new Error(`Missing or invalid canonical: ${page}`);
    if (/\bnoindex\b/i.test(html)) continue;
    urls.push(canonical);
}
if (new Set(urls).size !== urls.length) throw new Error('Duplicate canonical URLs');
urls.sort((a,b) => a.length - b.length || a.localeCompare(b));
await writeFile('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n') + '\n</urlset>\n');
console.log(`Sitemap generated with ${urls.length} canonical pages.`);
