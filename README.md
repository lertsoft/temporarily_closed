# Temporarily Closed NYC - Interactive 3D Book

An immersive 3D web experience showcasing the "Temporarily Closed NYC" book with interactive features.

## Features

- **Modern Navigation Bar**: Clean, responsive navbar with book title and navigation links
- **3D Book Visualization**: Floating book in 3D space with realistic lighting and shadows
- **Realistic Shadow Effects**: Ground plane with soft shadows beneath the book for depth
- **Interactive Controls**: 
  - Click and drag to rotate view around the book
  - Click the book to open it
  - Use arrow keys (←→) to turn pages
  - **Visual Navigation Arrows**: Click left/right arrows next to the book for easy page navigation
  - Press ESC to close the book
- **📱 Mobile-Optimized Experience**:
  - **Touch & Swipe Gestures**: Swipe left/right to turn pages on mobile devices
  - **Optimized Touch Controls**: Larger, touch-friendly navigation arrows
  - **Mobile-Specific UI**: Context-aware interface that adapts to touch devices
  - **Swipe Hint**: Animated tutorial appears briefly to guide mobile users
  - **Performance Optimizations**: Reduced rendering quality on mobile for smooth performance
  - **Responsive Camera Controls**: Adjusted zoom and rotation speeds for touch interaction
- **Realistic Page Flipping**: 3D animated page turns with wave effects that simulate real paper
- **Auto-Loop**: When reaching the last page, automatically loops back to the beginning
- **Purchase Popup**: Beautiful modal appears when cycling through all pages with call-to-action
- **Enhanced Brightness & Quality**: Optimized lighting and high-quality texture rendering
- **Smart UI Elements**: Navigation arrows appear only when book is open, with disabled states
- **Smooth Animations**: Book opening/closing and advanced page turning animations
- **Cross-Platform Design**: Seamlessly works on desktop and mobile devices
- **Loading Indicator**: Animated book loader while assets load

## 📱 AR Experience

Point your phone's camera at pages in the physical zine to unlock augmented reality content!

### AR Features
- **Image Target Tracking**: Uses MindAR.js for real-time image recognition
- **Cover Detection**: Animated 3D title floats above the cover
- **Regal Cinemas Page**: Before/after comparison - tap to toggle between "Temporarily Closed" and a bustling Times Square
- **AR Photo Gallery**: Unlocks after scanning an inside page and automatically jumps to the matched photo when a new page is scanned
- **Responsive UI**: Loading screen, scanning instructions, and info panels
- **Mobile-First Design**: Optimized for iOS Safari and Android Chrome

### How to Use AR
1. Open the website and click "📱 AR Experience" in the navbar
2. Allow camera access when prompted
3. Point your phone at the zine cover or Regal Cinemas page
4. Watch the AR content appear!
5. Tap on the Regal page to toggle before/after views

## Technologies Used

- **Three.js**: 3D graphics library for WebGL rendering
- **OrbitControls**: Camera control system for user interaction
- **MindAR.js**: Image tracking for AR experience
- **A-Frame**: Declarative 3D/AR content framework
- **ES6 Modules**: Modern JavaScript module system
- **CSS3**: Styling with modern features like backdrop filters

## Project Structure

```
temporarily_closed/
├── index.html              # Main HTML file (3D Book)
├── ar.html                 # AR Experience page
├── style.css               # Styling for 3D book
├── ar-style.css            # Styling for AR experience
├── app.js                  # Main 3D book application
├── ar-app.js               # AR experience logic
├── book-config.js          # Shared config for 3D book behavior/content
├── ar-config.js            # Shared config for AR metadata/targets
├── scripts/
│   └── smoke-test.mjs      # Basic project smoke test
├── package.json            # Project configuration
├── Temporarily_closed_cover.jpg    # Front cover
├── Temporarily_closed.jpg          # Back cover
├── ar-assets/              # AR-specific assets
│   ├── targets.mind        # Compiled image targets (see setup)
│   └── nyc-ambient.mp3     # Ambient audio (optional)
└── inside_book/            # Book pages
    ├── Temporarily_close1.jpg
    ├── Temporarily_close2.jpg
    ├── Temporarily_close3.jpg
    ├── Temporarily_close3.5.jpg
    ├── Temporarily_close4.jpg
    ├── Temporarily_close5.jpg
    ├── Temporarily_close6.jpg
    ├── Temporarily_close7.jpg
    └── Temporarily_close8.jpg
```

## How to Run

### Option 1: Using npm (Recommended)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   This will open the project in your default browser at `http://localhost:8080`

3. Run quality checks:
   ```bash
   npm run check
   ```

### Option 2: Using Python

If you have Python installed, you can use its built-in server:

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Then open `http://localhost:8080` in your browser.

### Option 3: Using any HTTP server

The project uses ES6 modules, so it needs to be served via HTTP (not just opened as a file). You can use any static file server.

## Controls

### Desktop Controls
- **Mouse**: Click and drag to rotate the view
- **Click on Book**: Opens the book / advances to next page (with realistic flip animation)
- **Arrow Keys**: Use keyboard ← → keys to turn pages
- **ESC Key**: Close the book

### Mobile Controls 📱
- **Touch**: Touch and drag to rotate the view
- **Tap on Book**: Opens the book / advances to next page
- **Swipe Gestures**: 
  - **Swipe Left**: Next page (loops to beginning after last page)
  - **Swipe Right**: Previous page (disabled on first page)
- **Touch Arrows**: Larger, touch-optimized ← → buttons beside the book
- **Swipe Tutorial**: Brief animated hint shows swipe gesture on first book opening

### Universal Controls
- **Visual Arrow Buttons**: Click/tap the ← → arrows that appear beside the book
- **Navigation Bar**: 
  - **"Temporarily Closed"**: Click/tap title to return to cover
  - **"Buy the book"**: Direct link to purchase page
  - **"About me"**: Link to author information
- **Purchase Popup**: Appears when cycling through all pages, with options to buy or continue reading

### Mobile Optimizations
- **Performance**: Automatically reduces rendering quality on mobile devices
- **Touch-Friendly**: All interactive elements sized appropriately for finger navigation
- **Gesture Recognition**: Smart swipe detection with proper thresholds and timing
- **Responsive UI**: Interface adapts based on screen size and input method

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

The project requires a modern browser with WebGL support.

## Performance Notes

- The application loads 11 high-resolution images (covers + pages)
- Initial load time depends on internet connection
- Once loaded, all interactions are smooth and responsive
- Optimized for both desktop and mobile performance

## Customization

To customize the book content:

1. Replace the cover images (`Temporarily_closed_cover.jpg` and `Temporarily_closed.jpg`)
2. Replace or add page images in the `inside_book/` directory
3. Update the `pageFiles` array in `app.js` if you change the page structure

## AR Setup (Required for AR Experience)

The AR experience requires a compiled `.mind` file containing the image targets. Follow these steps:

### Step 1: Compile Image Targets

1. Go to [MindAR Image Target Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile)
2. Upload the following images **in this exact order**:
   - `Temporarily_closed_cover.jpg` (Target 0 - Cover)
   - `inside_book/Temporarily_close3.jpg` (Target 1 - Regal Cinemas)
   - `inside_book/Temporarily_close1.jpg` (Target 2 - NYPL)
   - `inside_book/Temporarily_close2.jpg` (Target 3 - NYPL Lions)
   - `inside_book/Temporarily_close3.5.jpg` (Target 4 - NYSE)
   - `inside_book/Temporarily_close4.jpg` (Target 5 - Wall Street Bull)
   - `inside_book/Temporarily_close5.jpg` (Target 6 - Times Square)
   - `inside_book/Temporarily_close6.jpg` (Target 7 - Grand Central)
   - `inside_book/Temporarily_close7.jpg` (Target 8 - Washington Square Park)
   - `inside_book/Temporarily_close8.jpg` (Target 9 - 8th Avenue)
3. Click "Start" to compile
4. Review the feature visualization (more green dots = better tracking)
5. Click "Download" to get `targets.mind`
6. Move the file to `ar-assets/targets.mind`

### Step 2: Test Locally

```bash
npm run dev
# Navigate to http://localhost:8080/ar.html on your mobile device
# (Your device must be on the same network)
```

### Adding More AR Targets

To add more pages to the AR experience:

1. Add the new image to the MindAR compiler (along with existing images)
2. Re-download `targets.mind`
3. Add a new `<a-entity mindar-image-target="targetIndex: N">` in `ar.html`
4. Add corresponding AR content inside the entity

## License

MIT License - feel free to use and modify for your projects!
