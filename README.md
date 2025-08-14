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

## Technologies Used

- **Three.js**: 3D graphics library for WebGL rendering
- **OrbitControls**: Camera control system for user interaction
- **ES6 Modules**: Modern JavaScript module system
- **CSS3**: Styling with modern features like backdrop filters

## Project Structure

```
temporarily_closed/
├── index.html              # Main HTML file
├── style.css              # Styling
├── app.js                 # Main JavaScript application
├── package.json           # Project configuration
├── Temporarily_closed_cover.jpg    # Front cover
├── Temporarily_closed.jpg          # Back cover
└── inside_book/           # Book pages
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

## License

MIT License - feel free to use and modify for your projects!
