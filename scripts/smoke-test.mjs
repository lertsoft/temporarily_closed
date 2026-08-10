import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function read(path) {
    return readFileSync(resolve(root, path), 'utf8');
}

function run() {
    const requiredFiles = [
        'index.html',
        'ar.html',
        'brand.css',
        'ar-style.css',
        'app.js',
        'ar-app.js',
        'book-config.js',
        'ar-config.js'
    ];

    for (const file of requiredFiles) {
        assert(existsSync(resolve(root, file)), `Missing required file: ${file}`);
    }

    const appJs = read('app.js');
    const arAppJs = read('ar-app.js');
    const arHtml = read('ar.html');
    const brandCss = read('brand.css');
    const arStyleCss = read('ar-style.css');
    const styleCss = read('style.css');

    assert(appJs.includes('isAnimating') && appJs.includes('nextPage()'), 'Page-turn animation guard appears to be missing in app.js');
    assert(arAppJs.includes('setupAudioUnlock'), 'Audio unlock handler is missing in ar-app.js');
    assert(arHtml.includes('id="regal-tap-text"'), 'Regal tap text id is missing in ar.html');
    assert(arHtml.includes('href="brand.css"'), 'AR page is not loading the shared brand stylesheet');
    assert(arHtml.includes('class="navbar ar-navbar"'), 'AR page is missing the shared navigation treatment');
    assert(brandCss.includes('--brand-violet') && brandCss.includes('--brand-red'), 'Shared brand tokens are incomplete');
    assert(arStyleCss.includes('var(--brand-glass)') && arStyleCss.includes('var(--brand-violet)'), 'AR styles are not consuming shared brand tokens');
    assert(!styleCss.includes('font-size: 1px;'), 'style.css still contains an unusable mobile font-size of 1px');
}

try {
    run();
    console.log('Smoke test passed');
} catch (error) {
    console.error(`Smoke test failed: ${error.message}`);
    process.exit(1);
}
