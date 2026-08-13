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
        'ar-assets/display/2025-regal_cinema42st.jpg',
        'ar-assets/display/2025-nypl.jpg',
        'ar-assets/display/2025-nypl_lyon.jpg',
        'ar-assets/display/2025-nyse.jpg',
        'ar-assets/display/2025-wallst_bull.jpg',
        'ar-assets/display/2025-timesquare_police.jpg',
        'ar-assets/display/2025-grandcentral.jpg',
        'ar-assets/display/2025-washingtonsq_park.jpg',
        'ar-assets/display/2025-8ave.jpg',
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
    assert(arAppJs.includes('waitForSceneLoaded') && arAppJs.includes('startAR()'), 'Controlled AR startup lifecycle is missing');
    assert(arAppJs.includes('60000') && !arAppJs.includes('}, 15000);'), 'Mobile startup timeout handling has regressed');
    assert(arHtml.includes('id="regal-tap-text"'), 'Regal tap text id is missing in ar.html');
    assert(arHtml.includes('releases/1.5.0/aframe.min.js'), 'AR page is not using the MindAR-documented A-Frame version');
    assert(!arHtml.includes('<a-scene mindar-image='), 'MindAR must not autostart before lifecycle listeners are attached');
    assert(arHtml.includes('ar-assets/display/2025-regal_cinema42st.jpg'), 'AR page is not using optimized display images');
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
