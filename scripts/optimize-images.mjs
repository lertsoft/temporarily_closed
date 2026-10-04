import sharp from 'sharp';
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { basename, join } from 'node:path';

// Keep source JPEGs: printed MindAR targets and existing inbound links use them.
const sources = ['Temporarily_closed_cover.jpg', 'Temporarily_closed.jpg',
    ...(await readdir('inside_book')).filter(f => f.endsWith('.jpg')).map(f => join('inside_book', f)),
    ...(await readdir('ar-assets/display')).filter(f => f.endsWith('.jpg')).map(f => join('ar-assets/display', f))];
await mkdir('images', { recursive: true });
const manifest = {};
for (const source of sources) {
    const name = basename(source, '.jpg');
    const output = `images/${name}.webp`;
    const info = await sharp(source).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(output);
    manifest[source] = { src: output, width: info.width, height: info.height, bytes: (await stat(output)).size };
}
await writeFile('images/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Generated WebP images for ${sources.length} sources.`);
