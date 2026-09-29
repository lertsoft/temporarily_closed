/**
 * Temporarily Closed NYC - AR Experience
 * MindAR.js Application Logic
 */
import {
    TARGET_FILE_CANDIDATES,
    GALLERY_PHOTO_METADATA,
    TARGET_METADATA
} from './ar-config.js?v=20260925';

class ARExperience {
    constructor() {
        this.isLoaded = false;
        this.hasStarted = false;
        this.sceneSetupComplete = false;
        this.scene = null;
        this.arSystem = null;
        this.startupTimers = [];
        this.targetTexturePreloadStarted = false;
        this.activeTarget = null;
        this.regalShowingBefore = false;
        this.audioEnabled = false;
        this.galleryUnlocked = false;
        this.currentGalleryPhotoId = null;

        this.galleryPhotos = this.buildGalleryPhotos();
        this.targets = this.buildTargets();

        this.galleryPhotoMap = new Map(this.galleryPhotos.map((photo) => [photo.id, photo]));
        this.targetMap = new Map(this.targets.map((target) => [target.id, target]));

        this.init();
    }

    async init() {
        // Check for HTTPS requirement (required for camera access on iOS)
        if (!this.checkHTTPSRequirement()) {
            return;
        }

        this.scene = document.querySelector('a-scene');
        if (!this.scene) {
            this.showError('The AR scene could not be initialized.', { showRetry: true });
            return;
        }

        // Register lifecycle listeners before any asynchronous work or AR startup.
        // This prevents fast/cached loads from firing arReady before we are listening.
        this.setupARScene(this.scene);

        const targetFile = await this.resolveTargetsFile();
        if (!targetFile) {
            this.showMissingTargetsError();
            return;
        }

        this.configureSceneTargets(targetFile);
        try {
            await this.waitForSceneLoaded(this.scene);
        } catch (error) {
            this.showError('The AR engine could not load. Check your connection, then try again.', { showRetry: true });
            return;
        }
        this.onSceneLoaded();
        this.startAR();
    }

    async resolveTargetsFile() {
        for (const file of TARGET_FILE_CANDIDATES) {
            try {
                const response = await fetch(file, { method: 'HEAD' });
                if (response.ok) {
                    console.log(`Found target file: ${file}`);
                    return file;
                }
            } catch (error) {
                console.warn(`Unable to check target file: ${file}`, error);
            }
        }
        return null;
    }

    buildGalleryPhotos() {
        return GALLERY_PHOTO_METADATA.map((photoMeta) => ({ ...photoMeta }));
    }

    buildTargets() {
        const targetEntities = Array.from(
            document.querySelectorAll('a-entity[mindar-image-target][id^="target-"]')
        );

        return targetEntities.map((entity) => {
            const id = entity.id.replace(/^target-/, '');
            const metadata = TARGET_METADATA[id] || {};
            const defaultIndicator = `${id.toUpperCase()} Detected`;
            const hasMatchingPhoto = this.galleryPhotos.some((photo) => photo.id === id);

            return {
                id,
                entityId: entity.id,
                galleryPhotoId: metadata.galleryPhotoId || (hasMatchingPhoto ? id : null),
                ...metadata,
                indicatorLabel: metadata.indicatorLabel || defaultIndicator
            };
        });
    }

    configureSceneTargets(targetFile) {
        const scene = document.querySelector('a-scene');
        if (!scene) {
            return;
        }

        scene.setAttribute(
            'mindar-image',
            `imageTargetSrc: ${targetFile}; maxTrack: 1; filterMinCF: 0.001; filterBeta: 10; autoStart: false; uiLoading: no; uiScanning: no; uiError: no;`
        );
    }

    showMissingTargetsError() {
        this.clearStartupTimers();
        const loading = document.getElementById('loading-screen');
        const content = loading?.querySelector('.loading-content');

        if (content) {
            content.innerHTML = `
                <div class="https-error">
                    <div class="error-icon">📷</div>
                    <h1>Setup Required</h1>
                    <p class="loading-subtitle">Image Targets Missing</p>
                    <p class="error-message">
                        The AR image targets haven't been compiled yet.
                    </p>
                    <div class="error-solutions">
                        <p><strong>To complete setup:</strong></p>
                        <ol style="text-align: left; padding-left: 20px; color: rgba(255,255,255,0.7); font-size: 13px;">
                            <li style="padding: 4px 0;">Go to <a href="https://hiukim.github.io/mind-ar-js-doc/tools/compile" target="_blank" rel="noopener noreferrer" style="color: #C94A36;">MindAR Compiler</a></li>
                            <li style="padding: 4px 0;">Upload the zine images</li>
                            <li style="padding: 4px 0;">Download <code>targets.mind</code></li>
                            <li style="padding: 4px 0;">Place it in <code>ar-assets/</code> folder</li>
                        </ol>
                    </div>
                    <a href="index.html" class="back-link">← Back to Book</a>
                </div>
            `;
        }
    }

    setupARScene(scene) {
        scene.addEventListener('arReady', () => {
            console.log('MindAR ready');
            this.hideLoadingScreen();
            this.showScanInstructions();
            this.preloadTargetTexturesWhenIdle();
        });

        scene.addEventListener('arError', (e) => {
            console.error('AR Error:', e);
            this.showError(
                'The camera could not start. Check Safari camera access, then try again.',
                { showRetry: true }
            );
        });

        const retryButton = document.getElementById('retry-ar-btn');
        retryButton?.addEventListener('click', () => {
            window.location.reload();
        });
    }

    waitForSceneLoaded(scene) {
        if (scene.hasLoaded) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const timeout = window.setTimeout(() => reject(new Error('A-Frame scene load timed out')), 15000);
            scene.addEventListener('loaded', () => {
                window.clearTimeout(timeout);
                resolve();
            }, { once: true });
        });
    }

    onSceneLoaded() {
        if (this.sceneSetupComplete) {
            return;
        }

        this.sceneSetupComplete = true;
        this.arSystem = this.scene?.systems?.['mindar-image-system'] || null;

        console.log('A-Frame scene loaded');
        this.setupTargetListeners();
        this.setupUIListeners();
        this.setupAudioUnlock();
        this.setupGallery();
    }

    startAR() {
        if (this.hasStarted || this.isLoaded) {
            return;
        }

        if (!this.arSystem) {
            this.showError('The AR camera system is unavailable.', { showRetry: true });
            return;
        }

        this.hasStarted = true;
        this.updateLoadingStatus('Requesting camera access...');
        this.scheduleStartupProgress();

        try {
            this.arSystem.start();
        } catch (error) {
            console.error('Unable to start MindAR:', error);
            this.showError('The camera could not start. Please try again.', { showRetry: true });
        }
    }

    scheduleStartupProgress() {
        this.clearStartupTimers();

        // MindAR can have a usable camera stream before its tracking model has
        // finished loading. Reveal that stream immediately instead of covering it
        // with the full-screen loader for the entire initialization period.
        const cameraPoll = window.setInterval(() => {
            if (this.isCameraLive()) {
                window.clearInterval(cameraPoll);
                this.revealLiveCamera();
            }
        }, 200);
        this.startupTimers.push(cameraPoll);

        this.startupTimers.push(window.setTimeout(() => {
            if (!this.isLoaded) {
                this.updateLoadingStatus('Loading AR targets...');
            }
        }, 8000));

        this.startupTimers.push(window.setTimeout(() => {
            if (!this.isLoaded) {
                this.updateLoadingStatus('Preparing image tracking. The first visit can take a moment...');
            }
        }, 25000));

        this.startupTimers.push(window.setTimeout(() => {
            if (this.isLoaded) {
                return;
            }

            if (this.isCameraLive()) {
                this.updateLoadingStatus('Camera is on. Finishing AR setup...');
                this.showLoadingActions();
            } else {
                this.showError(
                    'The camera has not started. Check Safari camera access, then try again.',
                    { showRetry: true }
                );
            }
        }, 60000));
    }

    clearStartupTimers() {
        this.startupTimers.forEach((timerId) => window.clearTimeout(timerId));
        this.startupTimers = [];
    }

    isCameraLive() {
        const video = this.scene?.parentNode?.querySelector('video');
        const track = video?.srcObject?.getVideoTracks?.()[0];
        return Boolean(track && track.readyState === 'live' && video.readyState >= 2);
    }

    revealLiveCamera() {
        const loading = document.getElementById('loading-screen');
        if (!loading || loading.classList.contains('camera-live')) {
            return;
        }

        loading.classList.add('camera-live');
        this.updateLoadingStatus('Camera ready. Finishing image tracking...');
    }

    updateLoadingStatus(message, { isError = false } = {}) {
        const status = document.querySelector('#loading-screen .loading-status');
        if (!status) {
            return;
        }

        status.textContent = message;
        status.classList.toggle('error', isError);
    }

    showLoadingActions() {
        document.getElementById('loading-actions')?.classList.remove('hidden');
    }

    checkHTTPSRequirement() {
        const isSecure = window.location.protocol === 'https:' ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        if (!isSecure) {
            const loading = document.getElementById('loading-screen');
            const content = loading?.querySelector('.loading-content');

            if (content) {
                content.innerHTML = `
                    <div class="https-error">
                        <div class="error-icon">🔒</div>
                        <h1>HTTPS Required</h1>
                        <p class="loading-subtitle">For Camera Access</p>
                        <p class="error-message">
                            AR experiences require a secure connection (HTTPS) to access your camera.
                        </p>
                        <div class="error-solutions">
                            <p><strong>Solutions:</strong></p>
                            <ul>
                                <li>Deploy to a hosting service with HTTPS</li>
                                <li>Use <code>localhost</code> on the same device</li>
                                <li>Set up a local HTTPS tunnel (e.g., ngrok)</li>
                            </ul>
                        </div>
                        <a href="index.html" class="back-link">← Back to Book</a>
                    </div>
                `;
            }
            return false;
        }
        return true;
    }

    setupTargetListeners() {
        this.targets.forEach((target) => {
            const entity = document.getElementById(target.entityId);
            if (!entity) {
                return;
            }

            entity.addEventListener('targetFound', () => {
                console.log(`${target.id} target found`);
                this.onTargetFound(target.id);
            });

            entity.addEventListener('targetLost', () => {
                console.log(`${target.id} target lost`);
                this.onTargetLost(target.id);
            });

        });

        ['regal-before-plane', 'regal-after-plane'].forEach((id) => {
            document.getElementById(id)?.addEventListener('click', () => {
                if (this.activeTarget === 'regal') this.toggleRegalBeforeAfter();
            });
        });
    }

    setupUIListeners() {
        const toggleBtn = document.getElementById('toggle-view-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (this.activeTarget === 'regal') {
                    this.toggleRegalBeforeAfter();
                }
            });
        }

        const closeBtn = document.getElementById('close-info');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideInfoPanel();
            });
        }

        const coverInfoBtn = document.getElementById('cover-info-btn');
        if (coverInfoBtn) {
            coverInfoBtn.addEventListener('click', () => {
                this.showCoverInfo();
            });
        }

    }

    setupAudioUnlock() {
        const unlockAudio = () => {
            this.enableAudio();
            document.removeEventListener('pointerdown', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };

        document.addEventListener('pointerdown', unlockAudio, { once: true });
        document.addEventListener('touchstart', unlockAudio, { once: true });
    }

    setupGallery() {
        const track = document.getElementById('ar-gallery-track');
        if (!track) {
            return;
        }

        track.innerHTML = '';
        this.galleryPhotos.forEach((photo) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'ar-gallery-item';
            item.dataset.photoId = photo.id;
            item.innerHTML = `
                <img data-src="${photo.imageSrc}" alt="${photo.title}" loading="lazy" decoding="async">
                <span>${photo.title}</span>
            `;

            item.addEventListener('click', () => {
                this.focusGalleryPhoto(photo.id);
            });

            track.appendChild(item);
        });

        // Setup gallery control buttons
        const closeBtn = document.getElementById('gallery-close-btn');
        const cameraBtn = document.getElementById('gallery-camera-btn');
        const fullscreenBtn = document.getElementById('gallery-fullscreen-btn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideGallery();
            });
        }

        if (cameraBtn) {
            cameraBtn.addEventListener('click', () => {
                this.hideGallery();
                this.showScanInstructions();
            });
        }

        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleGalleryFullscreen();
            });
        }

        ['open-gallery-btn', 'open-gallery-shortcut'].forEach((id) => {
            document.getElementById(id)?.addEventListener('click', () => this.showGallery());
        });

    }

    showGallery() {
        const gallery = document.getElementById('ar-gallery');
        if (gallery) {
            gallery.classList.remove('hidden');
            gallery.classList.add('visible');
        }
        this.loadGalleryThumbnails();
        this.galleryUnlocked = true;
    }

    loadGalleryThumbnails() {
        document.querySelectorAll('#ar-gallery-track img[data-src]').forEach((image) => {
            image.src = image.dataset.src;
            image.removeAttribute('data-src');
        });
    }

    hideGallery() {
        const gallery = document.getElementById('ar-gallery');
        if (gallery) {
            gallery.classList.remove('visible');
            gallery.classList.add('hidden');
            gallery.classList.remove('photo-fullscreen');
        }
        document.getElementById('gallery-fullscreen-btn')?.setAttribute('aria-pressed', 'false');
    }

    toggleGalleryFullscreen() {
        const gallery = document.getElementById('ar-gallery');
        if (!gallery) return;

        const expanded = gallery.classList.toggle('photo-fullscreen');
        document.getElementById('gallery-fullscreen-btn')?.setAttribute('aria-pressed', String(expanded));
    }

    onTargetFound(targetName) {
        const target = this.targetMap.get(targetName);
        if (!target) {
            return;
        }

        this.loadTargetTextures(targetName);

        if (this.activeTarget === 'regal' && targetName !== 'regal') {
            this.resetRegalState();
            this.stopAmbientAudio();
        }

        this.activeTarget = targetName;
        this.hideScanInstructions();
        this.showTargetIndicator(targetName);

        if (targetName === 'cover') {
            this.updateInfoPanel(target.panelTitle, target.panelDescription, false);
            return;
        }

        const photo = this.galleryPhotoMap.get(target.galleryPhotoId);
        if (photo) {
            this.updateInfoPanel(photo.title, photo.description, Boolean(target.supportsCompare));
            this.focusGalleryPhoto(photo.id);
            this.unlockGallery();
            this.showInfoPanel();
        }

        if (target.playAudio) {
            this.playAmbientAudio();
        } else {
            this.stopAmbientAudio();
        }
    }

    onTargetLost(targetName) {
        if (this.activeTarget !== targetName) {
            return;
        }

        this.activeTarget = null;
        this.hideTargetIndicator();
        this.hideInfoPanel();
        this.showScanInstructions();
        this.stopAmbientAudio();

        if (targetName === 'regal') {
            this.resetRegalState();
        }
    }

    toggleRegalBeforeAfter() {
        const beforePlane = document.getElementById('regal-before-plane');
        const toggleBtn = document.getElementById('toggle-view-btn');
        const tapText = document.getElementById('regal-tap-text');

        if (!beforePlane) {
            return;
        }

        this.regalShowingBefore = !this.regalShowingBefore;

        if (this.regalShowingBefore) {
            beforePlane.setAttribute('animation', {
                property: 'material.opacity',
                to: 0.92,
                dur: 500,
                easing: 'easeOutCubic'
            });
            if (toggleBtn) {
                toggleBtn.textContent = 'Show After';
            }
            if (tapText) {
                tapText.setAttribute('value', 'TAP FOR AFTER');
            }
        } else {
            beforePlane.setAttribute('animation', {
                property: 'material.opacity',
                to: 0,
                dur: 500,
                easing: 'easeOutCubic'
            });
            if (toggleBtn) {
                toggleBtn.textContent = 'Show Before';
            }
            if (tapText) {
                tapText.setAttribute('value', 'TAP TO COMPARE');
            }
        }
    }

    resetRegalState() {
        const beforePlane = document.getElementById('regal-before-plane');
        if (beforePlane) {
            beforePlane.setAttribute('material', 'opacity', 0);
        }

        this.regalShowingBefore = false;

        const toggleBtn = document.getElementById('toggle-view-btn');
        if (toggleBtn) {
            toggleBtn.textContent = 'Show Before';
        }

        const tapText = document.getElementById('regal-tap-text');
        if (tapText) {
            tapText.setAttribute('value', 'TAP TO COMPARE');
        }
    }

    unlockGallery() {
        this.galleryUnlocked = true;
        document.getElementById('open-gallery-shortcut')?.classList.remove('hidden');
    }

    focusGalleryPhoto(photoId, options = {}) {
        const photo = this.galleryPhotoMap.get(photoId);
        if (!photo) {
            return;
        }

        this.currentGalleryPhotoId = photoId;

        // Update main photo display
        const mainImage = document.getElementById('gallery-main-image');
        const photoTitle = document.getElementById('gallery-photo-title');
        const photoDesc = document.getElementById('gallery-photo-description');
        const footerTitle = document.getElementById('gallery-footer-title');
        const footerDesc = document.getElementById('gallery-footer-desc');

        if (mainImage) {
            mainImage.src = photo.imageSrc;
            mainImage.alt = photo.title;
        }
        if (photoTitle) {
            photoTitle.textContent = photo.title;
        }
        if (photoDesc) {
            photoDesc.textContent = photo.description;
        }
        if (footerTitle) {
            footerTitle.textContent = photo.title;
        }
        if (footerDesc) {
            footerDesc.textContent = photo.description;
        }

        // Update thumbnail active state
        const items = document.querySelectorAll('.ar-gallery-item');
        items.forEach((item) => {
            const isActive = item.dataset.photoId === photoId;
            item.classList.toggle('active', isActive);
            if (isActive && options.scroll !== false) {
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        });
    }

    updateInfoPanel(title, description, showToggle) {
        const titleEl = document.getElementById('info-title');
        const descEl = document.getElementById('info-description');
        const toggleBtn = document.getElementById('toggle-view-btn');

        if (titleEl) {
            titleEl.textContent = title;
        }
        if (descEl) {
            descEl.textContent = description;
        }
        if (toggleBtn) {
            toggleBtn.style.display = showToggle ? 'block' : 'none';
        }
    }

    showInfoPanel() {
        const panel = document.getElementById('info-panel');
        if (panel) {
            panel.classList.remove('hidden');
        }
        document.getElementById('open-gallery-shortcut')?.classList.add('hidden');
    }

    hideInfoPanel() {
        const panel = document.getElementById('info-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
        if (this.galleryUnlocked) {
            document.getElementById('open-gallery-shortcut')?.classList.remove('hidden');
        }
    }

    showCoverInfo() {
        this.updateInfoPanel(
            'Temporarily Closed NYC',
            'A photo zine by Ronny Coste documenting NYC locations temporarily closed during the pandemic. Available for purchase.',
            false
        );
        this.showInfoPanel();
    }

    showScanInstructions() {
        const instructions = document.getElementById('scan-instructions');
        const text = instructions?.querySelector('.scan-text');
        if (text) {
            text.textContent = this.galleryUnlocked
                ? 'Scan another page to jump to a different AR photo'
                : 'Point camera at a page in the zine';
        }
        if (instructions) {
            instructions.classList.remove('hidden');
        }
    }

    hideScanInstructions() {
        const instructions = document.getElementById('scan-instructions');
        if (instructions) {
            instructions.classList.add('hidden');
        }
    }

    showTargetIndicator(targetName) {
        let indicator = document.querySelector('.target-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'target-indicator';
            document.body.appendChild(indicator);
        }

        const target = this.targetMap.get(targetName);
        indicator.textContent = target?.indicatorLabel || 'Target Detected';
        indicator.classList.remove('hidden');
    }

    hideTargetIndicator() {
        const indicator = document.querySelector('.target-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }

    hideLoadingScreen() {
        this.clearStartupTimers();
        const loading = document.getElementById('loading-screen');
        if (loading) {
            loading.classList.add('hidden');
            this.isLoaded = true;
        }
    }

    loadTargetTextures(targetName) {
        const target = document.getElementById(`target-${targetName}`);
        target?.querySelectorAll('[data-ar-image]').forEach((entity) => {
            if (!entity.getAttribute('src')) {
                entity.setAttribute('src', entity.dataset.arImage);
            }
        });
    }

    preloadTargetTexturesWhenIdle() {
        if (this.targetTexturePreloadStarted) {
            return;
        }
        this.targetTexturePreloadStarted = true;

        const targetNames = this.targets.map((target) => target.id);
        const loadNext = () => {
            const targetName = targetNames.shift();
            if (!targetName) {
                return;
            }
            this.loadTargetTextures(targetName);
            window.setTimeout(loadNext, 150);
        };

        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(loadNext, { timeout: 1500 });
        } else {
            window.setTimeout(loadNext, 300);
        }
    }

    showError(message, { showRetry = false } = {}) {
        this.clearStartupTimers();
        this.updateLoadingStatus(message, { isError: true });
        if (showRetry) {
            this.showLoadingActions();
        }
    }

    isTargetVisible(targetId) {
        const target = document.getElementById(targetId);
        return Boolean(target && target.object3D && target.object3D.visible);
    }

    playAmbientAudio() {
        const audio = document.getElementById('nyc-ambient');
        if (audio && this.audioEnabled) {
            audio.play().catch(() => console.log('Audio autoplay blocked'));
        }
    }

    stopAmbientAudio() {
        const audio = document.getElementById('nyc-ambient');
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    enableAudio() {
        this.audioEnabled = true;
        if (this.activeTarget === 'regal') {
            this.playAmbientAudio();
        }
    }
}

function initializeARExperience() {
    window.arExperience = new ARExperience();
}

// Module scripts normally run before DOMContentLoaded, but cached/deferred loads can
// execute later. Support both paths so initialization is never silently skipped.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeARExperience, { once: true });
} else {
    initializeARExperience();
}
