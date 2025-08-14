import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
            threshold: 50, // Minimum distance for swipe
            restraint: 100, // Maximum vertical distance for horizontal swipe
            allowedTime: 300 // Maximum time for swipe
        };

        this.textures = {
            front: null,
            back: null,
            pages: []
        };

        this.pageFiles = [
            'inside_book/Temporarily_close1.jpg',
            'inside_book/Temporarily_close2.jpg',
            'inside_book/Temporarily_close3.jpg',
            'inside_book/Temporarily_close3.5.jpg',
            'inside_book/Temporarily_close4.jpg',
            'inside_book/Temporarily_close5.jpg',
            'inside_book/Temporarily_close6.jpg',
            'inside_book/Temporarily_close7.jpg',
            'inside_book/Temporarily_close8.jpg'
        ];

        this.init();
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
        
        // Enhanced shadow settings
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Better color and tone mapping
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Enable shadow auto-update
        this.renderer.shadowMap.autoUpdate = true;
        
        const container = document.getElementById('canvas-container');
        container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        // Brighter ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(ambientLight);

        // Main directional light - increased intensity
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 5);
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 50;
        dirLight.shadow.camera.left = -10;
        dirLight.shadow.camera.right = 10;
        dirLight.shadow.camera.top = 10;
        dirLight.shadow.camera.bottom = -10;
        dirLight.shadow.mapSize.width = 4096; // Higher quality shadows
        dirLight.shadow.mapSize.height = 4096;
        dirLight.shadow.bias = -0.0001;
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
        
        // Load cover textures with enhanced quality settings
        this.textures.front = await loader.loadAsync('Temporarily_closed_cover.jpg');
        this.enhanceTexture(this.textures.front);
        
        this.textures.back = await loader.loadAsync('Temporarily_closed.jpg');
        this.enhanceTexture(this.textures.back);

        // Load page textures with enhanced quality
        for (const pageFile of this.pageFiles) {
            const texture = await loader.loadAsync(pageFile);
            this.enhanceTexture(texture);
            this.textures.pages.push(texture);
        }
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
        const bookWidth = 3;
        const bookHeight = 4;
        const bookThickness = 0.5;
        const pageThickness = 0.002;

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
        // Create invisible ground plane for realistic shadows
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.ShadowMaterial({
            opacity: 0.3
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        ground.position.y = -2.5; // Position below the book
        ground.receiveShadow = true;
        ground.name = 'ground';
        
        this.scene.add(ground);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Mobile-responsive controls
        const isMobile = window.innerWidth <= 768;
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
        const isMobile = window.innerWidth <= 768;
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

        // Keyboard events
        window.addEventListener('keydown', (event) => this.onKeyDown(event));

        // Navigation arrow events
        document.getElementById('prev-arrow').addEventListener('click', () => this.previousPage());
        document.getElementById('next-arrow').addEventListener('click', () => this.nextPage());

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
        if (this.bookState.isAnimating) return;

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
        if (this.bookState.currentPage < this.bookState.pages.length - 1) {
            this.animatePageTurn(this.bookState.currentPage, this.bookState.currentPage + 1);
        } else {
            // Loop back to the beginning
            this.animatePageTurn(this.bookState.currentPage, 0);
        }
    }

    previousPage() {
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
        
        // Check if we're going to the beginning (end of book reached)
        const isLooping = fromIndex === this.bookState.pages.length - 1 && toIndex === 0;
        
        toPage.visible = true;
        toPage.material.opacity = 0;
        
        // Create page flip geometry for animation
        const pageFlipGeometry = new THREE.PlaneGeometry(3 * 0.9, 4 * 0.9, 20, 1);
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
                const x = vertices[i];
                const originalX = x;
                
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
                
                // Show popup if we looped back to beginning
                if (isLooping) {
                    this.showPurchasePopup();
                }
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
        if (window.innerWidth > 768) return;
        
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

    showPurchasePopup() {
        // Create popup if it doesn't exist
        let popup = document.getElementById('purchase-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'purchase-popup';
            popup.className = 'purchase-popup';
            popup.innerHTML = `
                <div class="popup-content">
                    <div class="popup-header">
                        <h2>📖 Enjoyed the zine?</h2>
                        <button class="close-popup" id="close-popup">&times;</button>
                    </div>
                    <div class="popup-body">
                        <p>You have reached the end of the preview!</p>
                        <p><strong>You can buy this zine now here</strong></p>
                        <div class="popup-actions">
                            <a href="https://www.etsy.com/listing/1849155237/temporarily-closed-zine-pre-order" target="_blank" class="buy-button">
                                🛒 Buy Now
                            </a>
                            <button class="continue-reading" id="continue-reading">
                                📚 Continue Reading
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(popup);

            // Add event listeners
            document.getElementById('close-popup').addEventListener('click', () => this.hidePurchasePopup());
            document.getElementById('continue-reading').addEventListener('click', () => this.hidePurchasePopup());
            
            // Close on backdrop click
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    this.hidePurchasePopup();
                }
            });
        }

        // Show popup with animation
        popup.style.display = 'flex';
        setTimeout(() => {
            popup.classList.add('show');
        }, 10);
    }

    hidePurchasePopup() {
        const popup = document.getElementById('purchase-popup');
        if (popup) {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.style.display = 'none';
            }, 300);
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
