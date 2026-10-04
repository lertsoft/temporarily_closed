import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PAGE_FILES } from '../book-config.js';
import { GALLERY_PHOTO_METADATA } from '../ar-config.js';

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
        'images/2025-regal_cinema42st.webp',
        'images/2025-nypl.webp',
        'images/2025-nypl_lyon.webp',
        'images/2025-nyse.webp',
        'images/2025-wallst_bull.webp',
        'images/2025-timesquare_police.webp',
        'images/2025-grandcentral.webp',
        'images/2025-washingtonsq_park.webp',
        'images/2025-8ave.webp',
        'app.js',
        'ar-app.js',
        'book-config.js',
        'ar-config.js',
        'success.html'
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
    const bookConfigJs = read('book-config.js');
    const successHtml = read('success.html');
    const indexHtml = read('index.html');
    const targets = readFileSync(resolve(root, 'ar-assets/targets.mind'));

    assert(indexHtml.includes('href="https://buy.stripe.com/eVqcN70jac978xA32z14400"'), 'Buy the zine must link directly to the configured Stripe Payment Link');
    assert(indexHtml.includes('id="nav-buy-zine"'), 'Purchase link is missing from the book page');
    assert(!appJs.includes('showPurchasePopup'), 'The purchase modal must not intercept the Stripe link');
    assert(!styleCss.includes('.purchase-popup'), 'Unused purchase modal styles remain in style.css');
    assert(!appJs.includes('create-checkout-session'), 'Static site must not depend on a Checkout Session endpoint');
    assert(successHtml.includes('That receipt confirms your order'), 'Thank-you page must not claim an unverified payment');
    assert(appJs.includes('isAnimating') && appJs.includes('nextPage()'), 'Page-turn animation guard appears to be missing in app.js');
    assert(arAppJs.includes('setupAudioUnlock'), 'Audio unlock handler is missing in ar-app.js');
    assert(arAppJs.includes('waitForSceneLoaded') && arAppJs.includes('startAR()'), 'Controlled AR startup lifecycle is missing');
    assert(arAppJs.includes('60000') && !arAppJs.includes('}, 15000);'), 'Mobile startup timeout handling has regressed');
    assert(arAppJs.includes('revealLiveCamera') && arAppJs.includes('preloadTargetTexturesWhenIdle'), 'Mobile camera performance optimizations are missing');
    assert(arHtml.includes('id="regal-tap-text"'), 'Regal tap text id is missing in ar.html');
    assert(arHtml.includes('releases/1.6.0/aframe.min.js'), 'AR page must keep its original compatible A-Frame version');
    assert(!arHtml.includes('<a-scene mindar-image='), 'MindAR must not autostart before lifecycle listeners are attached');
    assert(arHtml.includes('images/2025-regal_cinema42st.webp'), 'AR page is not using optimized display images');
    assert(!arHtml.includes('<a-assets'), 'Nonessential images must not block AR scene and camera startup');
    assert(arHtml.includes('data-ar-image='), 'AR textures are not configured for deferred loading');
    assert(targets.subarray(0, 13).toString('hex') === '82a17602a8646174614c697374', 'Unexpected MindAR target bundle format');
    assert(targets[13] === 0x9a, 'AR bundle must contain the cover plus nine page targets');
    const targetIndices = [...arHtml.matchAll(/mindar-image-target="targetIndex: (\d+)"/g)].map((match) => Number(match[1]));
    assert(JSON.stringify(targetIndices) === JSON.stringify([...Array(10).keys()]), 'AR scene target indices do not match bundle order');
    assert(GALLERY_PHOTO_METADATA.length === PAGE_FILES.length, 'AR gallery and book pages are out of sync');
    for (const photo of GALLERY_PHOTO_METADATA) {
        assert(existsSync(resolve(root, photo.imageSrc)), `Missing gallery photo: ${photo.imageSrc}`);
    }
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
