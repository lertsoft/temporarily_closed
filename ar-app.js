/**
 * Temporarily Closed NYC - AR Experience
 * MindAR.js Application Logic
 */

class ARExperience {
    constructor() {
        this.isLoaded = false;
        this.activeTarget = null;
        this.regalShowingBefore = false;
        this.audioEnabled = false;
        this.galleryUnlocked = false;
        this.currentGalleryPhotoId = null;

        this.galleryPhotos = [
            {
                id: 'regal',
                title: 'Regal Cinemas - Times Square',
                description: 'Times Square theater activity has returned after its pandemic closure.',
                imageSrc: 'ar-assets/2025-regal_cinema42st.jpg'
            },
            {
                id: 'nypl',
                title: 'New York Public Library',
                description: 'Street-level view outside the New York Public Library after reopening.',
                imageSrc: 'ar-assets/2025-nypl.jpg'
            },
            {
                id: 'nypl-lyon',
                title: 'NYPL Lions',
                description: 'Patience and Fortitude outside NYPL in a busier city moment.',
                imageSrc: 'ar-assets/2025-nypl_lyon.jpg'
            },
            {
                id: 'nyse',
                title: 'New York Stock Exchange',
                description: 'Wall Street foot traffic and activity near the NYSE.',
                imageSrc: 'ar-assets/2025-nyse.jpg'
            },
            {
                id: 'wallst-bull',
                title: 'Charging Bull',
                description: 'Lower Manhattan crowds around the iconic Wall Street bull.',
                imageSrc: 'ar-assets/2025-wallst_bull.jpg'
            },
            {
                id: 'timesquare-police',
                title: 'Times Square',
                description: 'A contemporary Times Square street scene with heavy pedestrian flow.',
                imageSrc: 'ar-assets/2025-timesquare_police.jpg'
            },
            {
                id: 'grandcentral',
                title: 'Grand Central',
                description: 'Commuter movement and restored rhythm around Grand Central.',
                imageSrc: 'ar-assets/2025-grandcentral.jpg'
            },
            {
                id: 'washingtonsq',
                title: 'Washington Square Park',
                description: 'Public life and gatherings in Washington Square Park.',
                imageSrc: 'ar-assets/2025-washingtonsq_park.jpg'
            },
            {
                id: '8ave',
                title: '8th Avenue',
                description: 'A reopened 8th Avenue corridor with normal city traffic.',
                imageSrc: 'ar-assets/2025-8ave.jpg'
            }
        ];

        this.targets = [
            {
                id: 'cover',
                entityId: 'target-cover',
                indicatorLabel: 'Cover Detected',
                panelTitle: 'Temporarily Closed NYC',
                panelDescription: 'A photo zine documenting NYC locations temporarily closed during the pandemic. Scan inner pages to open the AR gallery.'
            },
            {
                id: 'regal',
                entityId: 'target-regal',
                indicatorLabel: 'Regal Cinemas Detected',
                galleryPhotoId: 'regal',
                supportsCompare: true,
                playAudio: true
            },
            {
                id: 'nypl',
                entityId: 'target-nypl',
                indicatorLabel: 'NYPL Detected',
                galleryPhotoId: 'nypl'
            },
            {
                id: 'nypl-lyon',
                entityId: 'target-nypl-lyon',
                indicatorLabel: 'NYPL Lions Detected',
                galleryPhotoId: 'nypl-lyon'
            },
            {
                id: 'nyse',
                entityId: 'target-nyse',
                indicatorLabel: 'NYSE Detected',
                galleryPhotoId: 'nyse'
            },
            {
                id: 'wallst-bull',
                entityId: 'target-wallst-bull',
                indicatorLabel: 'Wall St Bull Detected',
                galleryPhotoId: 'wallst-bull'
            },
            {
                id: 'timesquare-police',
                entityId: 'target-timesquare-police',
                indicatorLabel: 'Times Square Detected',
                galleryPhotoId: 'timesquare-police'
            },
            {
                id: 'grandcentral',
                entityId: 'target-grandcentral',
                indicatorLabel: 'Grand Central Detected',
                galleryPhotoId: 'grandcentral'
            },
            {
                id: 'washingtonsq',
                entityId: 'target-washingtonsq',
                indicatorLabel: 'Washington Sq Detected',
                galleryPhotoId: 'washingtonsq'
            },
            {
                id: '8ave',
                entityId: 'target-8ave',
                indicatorLabel: '8th Ave Detected',
                galleryPhotoId: '8ave'
            }
        ];

        this.galleryPhotoMap = new Map(this.galleryPhotos.map((photo) => [photo.id, photo]));
        this.targetMap = new Map(this.targets.map((target) => [target.id, target]));

        this.init();
    }

    async init() {
        // Check for HTTPS requirement (required for camera access on iOS)
        if (!this.checkHTTPSRequirement()) {
            return;
        }

        const targetFile = await this.resolveTargetsFile();
        if (!targetFile) {
            this.showMissingTargetsError();
            return;
        }

        this.configureSceneTargets(targetFile);
        this.setupARScene();
    }

    async resolveTargetsFile() {
        try {
            const files = ['ar-assets/targets.mind', 'ar-assets/cover.mind', 'ar-assets/target.mind'];
            for (const file of files) {
                const response = await fetch(file, { method: 'HEAD' });
                if (response.ok) {
                    console.log(`Found target file: ${file}`);
                    return file;
                }
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    configureSceneTargets(targetFile) {
        const scene = document.querySelector('a-scene');
        if (!scene) {
            return;
        }

        scene.setAttribute(
            'mindar-image',
            `imageTargetSrc: ${targetFile}; maxTrack: 1; filterMinCF: 0.001; filterBeta: 10;`
        );
    }

    showMissingTargetsError() {
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
                            <li style="padding: 4px 0;">Go to <a href="https://hiukim.github.io/mind-ar-js-doc/tools/compile" target="_blank" style="color: #C94A36;">MindAR Compiler</a></li>
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

    setupARScene() {
        const scene = document.querySelector('a-scene');
        if (!scene) {
            return;
        }

        scene.addEventListener('loaded', () => {
            console.log('A-Frame scene loaded');
            this.setupTargetListeners();
            this.setupUIListeners();
            this.setupGallery();
            this.hideLoadingScreen();
        });

        scene.addEventListener('arReady', () => {
            console.log('MindAR ready');
            this.showScanInstructions();
        });

        scene.addEventListener('arError', (e) => {
            console.error('AR Error:', e);
            this.showError('Camera access denied or AR not supported');
        });

        setTimeout(() => {
            if (!this.isLoaded) {
                this.showError('AR is taking too long to load. Try refreshing the page.');
            }
        }, 15000);
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

            if (target.supportsCompare) {
                entity.addEventListener('click', () => {
                    this.toggleRegalBeforeAfter();
                });
            }
        });

        const regalBeforePlane = document.getElementById('regal-before-plane');
        if (regalBeforePlane) {
            regalBeforePlane.addEventListener('click', () => {
                this.toggleRegalBeforeAfter();
            });
        }
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

        const scene = document.querySelector('a-scene');
        if (!scene) {
            return;
        }

        scene.addEventListener('click', () => {
            if (this.activeTarget === 'regal' && this.isTargetVisible('target-regal')) {
                this.toggleRegalBeforeAfter();
            }
        });
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
                <img src="${photo.imageSrc}" alt="${photo.title}">
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

        this.focusGalleryPhoto(this.galleryPhotos[0].id, { scroll: false });
    }

    showGallery() {
        const gallery = document.getElementById('ar-gallery');
        if (gallery) {
            gallery.classList.remove('hidden');
            gallery.classList.add('visible');
        }
        this.galleryUnlocked = true;
    }

    hideGallery() {
        const gallery = document.getElementById('ar-gallery');
        if (gallery) {
            gallery.classList.remove('visible');
            gallery.classList.add('hidden');
        }
    }

    toggleGalleryFullscreen() {
        const gallery = document.getElementById('ar-gallery');
        if (!gallery) return;

        if (!document.fullscreenElement) {
            gallery.requestFullscreen().catch(err => {
                console.log('Fullscreen not supported:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    onTargetFound(targetName) {
        const target = this.targetMap.get(targetName);
        if (!target) {
            return;
        }

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
        const tapIndicator = document.getElementById('regal-tap-indicator');
        const tapText = tapIndicator?.querySelector('a-text');

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
    }

    unlockGallery() {
        if (this.galleryUnlocked) {
            return;
        }

        this.showGallery();
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
    }

    hideInfoPanel() {
        const panel = document.getElementById('info-panel');
        if (panel) {
            panel.classList.add('hidden');
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
        const loading = document.getElementById('loading-screen');
        if (loading) {
            loading.classList.add('hidden');
            this.isLoaded = true;
        }
    }

    showError(message) {
        const loading = document.getElementById('loading-screen');
        const status = loading?.querySelector('.loading-status');
        if (status) {
            status.textContent = message;
            status.style.color = '#C94A36';
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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.arExperience = new ARExperience();
});
