import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
    MOBILE_BREAKPOINT,
    SWIPE_CONFIG,
    BOOK_DIMENSIONS,
    PAGE_FILES
} from './book-config.js?v=20261004';

class InteractiveBook {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.book = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.bookState = {
            isOpen: false,
            currentPage: 0,
            isAnimating: false,
            pages: []
        };

        // Touch/swipe handling
        this.touchState = {
            startX: 0,
            startY: 0,
            ...SWIPE_CONFIG
        };

        this.textures = {
            front: null,
            back: null,
            pages: []
        };

        this.pageFiles = PAGE_FILES;
        this.pointerStart = null;
        this.wasDragging = false;
        this.init().catch((error) => {
            console.error('The book preview could not load:', error);
            document.querySelector('#loading-screen .loader')?.replaceChildren(
                Object.assign(document.createElement('p'), {
                    textContent: 'The interactive preview could not load. Please refresh the page or use the purchase link above.'
                })
            );
        });
    }

    async init() {
        this.setupScene();
        this.setupLighting();
        await this.loadTextures();
        this.createBook();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
        this.hideLoadingScreen();
    }

    setupScene() {
        // Scene with transparent background for white page background
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent background to show white page
        // Light subtle fog for depth
        this.scene.fog = new THREE.Fog(0xffffff, 20, 50);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 5);

        // Enhanced renderer for better quality
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
        
        // The soft contact shadow is drawn with a small gradient texture.
        this.renderer.shadowMap.enabled = false;
        
        // Better color and tone mapping
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        const container = document.getElementById('canvas-container');
        this.renderer.domElement.setAttribute('role', 'img');
        this.renderer.domElement.setAttribute('aria-label', 'Interactive 3D preview of Temporarily Closed NYC, a photo zine by Ronny Coste documenting New York City during the pandemic.');
        container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        // Brighter ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(ambientLight);

        // Main directional light - increased intensity
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 5);
        this.scene.add(dirLight);

        // Brighter fill light from opposite side
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);

        // Additional side lighting for better book visibility
        const sideLight1 = new THREE.DirectionalLight(0xffffff, 0.4);
        sideLight1.position.set(-8, 0, 2);
        this.scene.add(sideLight1);

        const sideLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        sideLight2.position.set(8, 0, 2);
        this.scene.add(sideLight2);

        // Point light for book glow effect - brighter
        const pointLight = new THREE.PointLight(0xffffff, 0.8, 15);
        pointLight.position.set(0, 3, 3);
        this.scene.add(pointLight);

        // Additional point light from below for even lighting
        const bottomLight = new THREE.PointLight(0xffffff, 0.3, 10);
        bottomLight.position.set(0, -2, 2);
        this.scene.add(bottomLight);
    }

    async loadTextures() {
        const loader = new THREE.TextureLoader();
        
        // Load the small WebP derivatives in parallel for the original automatic-start viewer.
        const textures = await Promise.all([
            'images/Temporarily_closed_cover.webp', 'images/Temporarily_closed.webp', ...this.pageFiles
        ].map(file => loader.loadAsync(file)));
        textures.forEach(texture => this.enhanceTexture(texture));
        [this.textures.front, this.textures.back, ...this.textures.pages] = textures;
    }

    enhanceTexture(texture) {
        // Enable anisotropic filtering for crisp textures at any angle
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        
        // Use higher quality filtering
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        
        // Generate mipmaps for better quality at distance
        texture.generateMipmaps = true;
        
        // Proper texture wrapping
        texture.wrapS = THREE.ClampToEdgeWrap;
        texture.wrapT = THREE.ClampToEdgeWrap;
        
        // Color space for better color reproduction
        texture.colorSpace = THREE.SRGBColorSpace;
        
        // Keep default Y-axis orientation (flipY = true by default in Three.js)
        // texture.flipY = true; // This is the default, so we don't need to set it
    }

    createBook() {
        this.book = new THREE.Group();

        // Book dimensions
        const bookWidth = BOOK_DIMENSIONS.width;
        const bookHeight = BOOK_DIMENSIONS.height;
        const bookThickness = BOOK_DIMENSIONS.thickness;
        const pageThickness = BOOK_DIMENSIONS.pageThickness;

        // Create book cover (closed state)
        const coverGeometry = new THREE.BoxGeometry(bookWidth, bookHeight, bookThickness);
        
        // Enhanced materials for different faces
        const coverMaterials = [
            new THREE.MeshStandardMaterial({ 
                color: 0x666666,
                roughness: 0.7,
                metalness: 0.1
            }), // Right side
            new THREE.MeshStandardMaterial({ 
                color: 0x666666,
                roughness: 0.7,
                metalness: 0.1
            }), // Left side
            new THREE.MeshStandardMaterial({ 
                color: 0x666666,
                roughness: 0.7,
                metalness: 0.1
            }), // Top
            new THREE.MeshStandardMaterial({ 
                color: 0x666666,
                roughness: 0.7,
                metalness: 0.1
            }), // Bottom
            new THREE.MeshStandardMaterial({ 
                map: this.textures.front,
                roughness: 0.4,
                metalness: 0.05,
                emissive: 0x111111,
                emissiveIntensity: 0.1
            }), // Front
            new THREE.MeshStandardMaterial({ 
                map: this.textures.back,
                roughness: 0.4,
                metalness: 0.05,
                emissive: 0x111111,
                emissiveIntensity: 0.1
            })  // Back
        ];

        const cover = new THREE.Mesh(coverGeometry, coverMaterials);
        cover.castShadow = true;
        cover.receiveShadow = true;
        cover.name = 'bookCover';
        this.book.add(cover);

        // Create pages (initially hidden)
        this.createPages(bookWidth, bookHeight, pageThickness);

        // Create ground/shadow plane
        this.createGroundPlane();

        // Add book to scene
        this.scene.add(this.book);

        // Initial book rotation for better view
        this.book.rotation.y = Math.PI * 0.1;
    }

    createPages(width, height, thickness) {
        const pageGroup = new THREE.Group();
        pageGroup.name = 'pages';
        pageGroup.visible = false;

        // Create individual pages with enhanced materials
        for (let i = 0; i < this.textures.pages.length; i++) {
            const pageGeometry = new THREE.PlaneGeometry(width * 0.9, height * 0.9);
            
            // Enhanced double-sided material for each page
            const pageMaterial = new THREE.MeshStandardMaterial({
                map: this.textures.pages[i],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 1,
                roughness: 0.8, // Slightly rough like paper
                metalness: 0.0, // No metallic properties for paper
                emissive: 0x050505, // Slight emissive for brightness
                emissiveIntensity: 0.15,
                alphaTest: 0.01 // Better transparency handling
            });

            const page = new THREE.Mesh(pageGeometry, pageMaterial);
            page.position.z = i * thickness * 2;
            page.name = `page_${i}`;
            page.visible = false;
            page.castShadow = false; // Pages don't cast shadows for performance
            page.receiveShadow = true;
            
            pageGroup.add(page);
            this.bookState.pages.push(page);
        }

        this.book.add(pageGroup);
    }

    createGroundPlane() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 128;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(64, 64, 10, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(25, 23, 32, 0.3)');
        gradient.addColorStop(0.45, 'rgba(25, 23, 32, 0.13)');
        gradient.addColorStop(1, 'rgba(25, 23, 32, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 128, 128);

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(5.5, 3.8),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2.35;
        ground.name = 'ground';
        this.scene.add(ground);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Mobile-responsive controls
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
        this.controls.rotateSpeed = isMobile ? 0.8 : 0.5; // Faster rotation on mobile
        this.controls.minDistance = isMobile ? 2.5 : 3;
        this.controls.maxDistance = isMobile ? 8 : 10;
        
        // Touch-friendly settings
        this.controls.enablePan = false; // Disable panning to avoid conflicts with swipe
        this.controls.enableZoom = true;
        this.controls.zoomSpeed = isMobile ? 0.8 : 1.0;
        
        this.controls.target.set(0, 0, 0);
        
        // Update controls on window resize
        window.addEventListener('resize', () => this.updateControlsForDevice());
    }

    updateControlsForDevice() {
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
        if (this.controls) {
            this.controls.rotateSpeed = isMobile ? 0.8 : 0.5;
            this.controls.minDistance = isMobile ? 2.5 : 3;
            this.controls.maxDistance = isMobile ? 8 : 10;
            this.controls.zoomSpeed = isMobile ? 0.8 : 1.0;
        }
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Mouse events
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.renderer.domElement.addEventListener('pointerdown', (event) => {
            this.pointerStart = { x: event.clientX, y: event.clientY };
            this.wasDragging = false;
        });
        this.renderer.domElement.addEventListener('pointermove', (event) => {
            if (this.pointerStart && Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y) > 6) {
                this.wasDragging = true;
            }
        });
        this.renderer.domElement.addEventListener('pointerup', () => { this.pointerStart = null; });

        // Keyboard events
        window.addEventListener('keydown', (event) => this.onKeyDown(event));

        // Navigation arrow events
        document.getElementById('prev-arrow').addEventListener('click', () => this.previousPage());
        document.getElementById('next-arrow').addEventListener('click', () => this.nextPage());
        document.getElementById('toggle-book').addEventListener('click', () => {
            if (this.bookState.isAnimating) return;
            if (this.bookState.isOpen) this.closeBook();
            else this.openBook();
        });

        // Touch/swipe events for mobile
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        let startTime, startTouchX, startTouchY;

        // Touch start
        this.renderer.domElement.addEventListener('touchstart', (e) => {
            if (!this.bookState.isOpen) return;
            
            const touch = e.touches[0];
            startTouchX = touch.clientX;
            startTouchY = touch.clientY;
            startTime = Date.now();
            
            // Prevent default to avoid scrolling
            e.preventDefault();
        }, { passive: false });

        // Touch end - detect swipe
        this.renderer.domElement.addEventListener('touchend', (e) => {
            if (!this.bookState.isOpen || this.bookState.isAnimating) return;
            
            const touch = e.changedTouches[0];
            const endTouchX = touch.clientX;
            const endTouchY = touch.clientY;
            const endTime = Date.now();
            
            const distanceX = endTouchX - startTouchX;
            const distanceY = endTouchY - startTouchY;
            const elapsedTime = endTime - startTime;
            
            // Check if it's a valid swipe
            if (elapsedTime <= this.touchState.allowedTime && 
                Math.abs(distanceX) >= this.touchState.threshold && 
                Math.abs(distanceY) <= this.touchState.restraint) {
                
                // Hide swipe hint on first use
                this.hideSwipeHint();
                
                if (distanceX > 0) {
                    // Swipe right - previous page
                    this.previousPage();
                } else {
                    // Swipe left - next page
                    this.nextPage();
                }
            }
            
            e.preventDefault();
        }, { passive: false });

        // Prevent touch move scrolling when book is open
        this.renderer.domElement.addEventListener('touchmove', (e) => {
            if (this.bookState.isOpen) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Check for hover over book
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.book, true);
        
        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'grab';
        }
    }

    onMouseClick(event) {
        if (this.bookState.isAnimating || this.wasDragging) return;

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.book, true);

        if (intersects.length > 0) {
            if (!this.bookState.isOpen) {
                this.openBook();
            } else {
                this.nextPage();
            }
        }
    }

    onKeyDown(event) {
        if (this.bookState.isAnimating || !this.bookState.isOpen) return;

        switch(event.key) {
            case 'ArrowRight':
                this.nextPage();
                break;
            case 'ArrowLeft':
                this.previousPage();
                break;
            case 'Escape':
                this.closeBook();
                break;
        }
    }

    async openBook() {
        this.bookState.isAnimating = true;
        this.bookState.isOpen = true;
        const openingRotation = Math.atan2(Math.sin(this.book.rotation.y), Math.cos(this.book.rotation.y));

        // Hide the cover
        const cover = this.book.getObjectByName('bookCover');
        
        // Animate book opening
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            this.book.rotation.y = openingRotation * (1 - easeProgress);
            
            // Fade out cover
            cover.material.forEach(mat => {
                mat.opacity = 1 - easeProgress;
                mat.transparent = true;
            });

            // Show pages
            const pages = this.book.getObjectByName('pages');
            pages.visible = true;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                cover.visible = false;
                this.bookState.isAnimating = false;
                this.showPage(0);
                this.updatePageIndicator();
                this.showNavigationArrows();
                this.showSwipeHint();
                this.updateBookButton();
            }
        };
        
        animate();
    }

    closeBook() {
        this.bookState.isAnimating = true;
        this.bookState.isOpen = false;

        // Hide all pages
        this.bookState.pages.forEach(page => page.visible = false);

        // Show and animate cover back
        const cover = this.book.getObjectByName('bookCover');
        cover.visible = true;
        
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Fade in cover
            cover.material.forEach(mat => {
                mat.opacity = progress;
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                const pages = this.book.getObjectByName('pages');
                pages.visible = false;
                this.bookState.isAnimating = false;
                this.bookState.currentPage = 0;
                this.updatePageIndicator();
                this.hideNavigationArrows();
                this.hideSwipeHint();
                this.updateBookButton();
            }
        };
        
        animate();
    }

    showPage(index) {
        // Hide all pages
        this.bookState.pages.forEach(page => page.visible = false);
        
        // Show current page
        if (index >= 0 && index < this.bookState.pages.length) {
            this.bookState.pages[index].visible = true;
            this.bookState.currentPage = index;
        }
        
        this.updatePageIndicator();
    }

    nextPage() {
        if (!this.bookState.isOpen || this.bookState.isAnimating) return;

        if (this.bookState.currentPage < this.bookState.pages.length - 1) {
            this.animatePageTurn(this.bookState.currentPage, this.bookState.currentPage + 1);
        } else {
            // Loop back to the beginning
            this.animatePageTurn(this.bookState.currentPage, 0);
        }
    }

    previousPage() {
        if (!this.bookState.isOpen || this.bookState.isAnimating) return;

        if (this.bookState.currentPage > 0) {
            this.animatePageTurn(this.bookState.currentPage, this.bookState.currentPage - 1);
        }
    }

    animatePageTurn(fromIndex, toIndex) {
        this.bookState.isAnimating = true;
        
        const duration = 800;
        const startTime = Date.now();
        
        const fromPage = this.bookState.pages[fromIndex];
        const toPage = this.bookState.pages[toIndex];
        
        toPage.visible = true;
        toPage.material.opacity = 0;
        
        // Create page flip geometry for animation
        const pageFlipGeometry = new THREE.PlaneGeometry(
            BOOK_DIMENSIONS.width * 0.9,
            BOOK_DIMENSIONS.height * 0.9,
            20,
            1
        );
        const originalPositions = pageFlipGeometry.attributes.position.array.slice();
        const pageFlipMaterial = fromPage.material.clone();
        const pageFlip = new THREE.Mesh(pageFlipGeometry, pageFlipMaterial);
        
        // Position the flip page
        pageFlip.position.copy(fromPage.position);
        pageFlip.visible = true;
        this.book.add(pageFlip);
        
        // Hide the original page
        fromPage.visible = false;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // Page flip animation
            const vertices = pageFlipGeometry.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
                const originalX = originalPositions[i];
                
                // Create wave effect for page turning
                const waveIntensity = Math.sin(progress * Math.PI) * 0.5;
                const rotationY = easeProgress * Math.PI;
                
                // Apply rotation based on X position
                const rotationFactor = (originalX + 1.5) / 3; // Normalize X to 0-1
                vertices[i] = originalX * Math.cos(rotationY * rotationFactor);
                vertices[i + 2] = Math.sin(rotationY * rotationFactor) * waveIntensity;
            }
            
            pageFlipGeometry.attributes.position.needsUpdate = true;
            
            // Fade in the new page
            toPage.material.opacity = easeProgress;
            
            // Fade out the flipping page
            pageFlipMaterial.opacity = 1 - easeProgress * 0.7;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Clean up
                this.book.remove(pageFlip);
                pageFlipGeometry.dispose();
                pageFlipMaterial.dispose();
                
                this.bookState.currentPage = toIndex;
                this.bookState.isAnimating = false;
                this.updatePageIndicator();
                this.updateNavigationArrows();
            }
        };
        
        animate();
    }

    updatePageIndicator() {
        const indicator = document.getElementById('current-page');
        if (!this.bookState.isOpen) {
            indicator.textContent = 'Cover';
        } else {
            indicator.textContent = `Page ${this.bookState.currentPage + 1} of ${this.bookState.pages.length}`;
        }
    }

    updateBookButton() {
        document.getElementById('toggle-book').textContent = this.bookState.isOpen ? 'Close preview' : 'Open preview';
    }

    showNavigationArrows() {
        const arrows = document.getElementById('navigation-arrows');
        arrows.classList.add('show');
        this.updateNavigationArrows();
    }

    hideNavigationArrows() {
        const arrows = document.getElementById('navigation-arrows');
        arrows.classList.remove('show');
    }

    updateNavigationArrows() {
        if (!this.bookState.isOpen) return;

        const prevArrow = document.getElementById('prev-arrow');
        const nextArrow = document.getElementById('next-arrow');

        // Update previous arrow state
        if (this.bookState.currentPage === 0) {
            prevArrow.disabled = true;
        } else {
            prevArrow.disabled = false;
        }

        // Next arrow is always enabled since we loop back to beginning
        nextArrow.disabled = false;
    }

    showSwipeHint() {
        // Only show on mobile devices
        if (window.innerWidth > MOBILE_BREAKPOINT) return;
        
        const swipeHint = document.getElementById('swipe-hint');
        if (swipeHint) {
            swipeHint.classList.add('show');
            
            // Hide after 3 seconds
            setTimeout(() => {
                this.hideSwipeHint();
            }, 3000);
        }
    }

    hideSwipeHint() {
        const swipeHint = document.getElementById('swipe-hint');
        if (swipeHint) {
            swipeHint.classList.remove('show');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update controls
        this.controls.update();

        // Floating animation
        if (this.book && !this.bookState.isOpen) {
            this.book.position.y = Math.sin(Date.now() * 0.001) * 0.1;
            this.book.rotation.y += 0.002;
        }

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    new InteractiveBook();
});
