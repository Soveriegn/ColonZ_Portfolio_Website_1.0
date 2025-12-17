// Carousel logic extracted from sketch.js
// This file controls the image carousel on the homepage.
// You can change the number of images, image sources, and carousel settings here.

// --- Global Variables ---
// Number of images in the carousel (change NUM_IMGS to adjust demo images)
const NUM_IMGS = 5,
  imgs = [];
// Current image index
let currentImg = 0;
// Carousel width and height (change CAR_W and CAR_H to adjust default size)
const CAR_W = 640, CAR_H = 360;
let canvasEl, controls;
let autoAdvanceIntervalId = null;
// How long before the carousel auto-advances (in milliseconds)
const AUTO_ADVANCE_MS = 30 * 1000; // 30 seconds

// The desired aspect ratio for images (width divided by height)
const DESIRED_ASPECT = CAR_W / CAR_H;

// --- Preload Function ---
// Loads images for the carousel. If you want to use your own images,
// define IMAGE_LIST or IMAGE_PATH_LIST in images.js.
function preload() {
  // If IMAGE_PATH_LIST is a function, use it to get image paths
  if (typeof IMAGE_PATH_LIST === 'function') {
    const list = IMAGE_PATH_LIST();
    for (let i = 0; i < list.length; i++) {
      imgs[i] = loadImage(list[i]);
    }
  } else if (typeof IMAGE_LIST !== 'undefined' && Array.isArray(IMAGE_LIST) && IMAGE_LIST.length > 0) {
    // If IMAGE_LIST is defined, use those images
    for (let i = 0; i < IMAGE_LIST.length; i++) {
      imgs[i] = loadImage(IMAGE_LIST[i]);
    }
  } else {
    // Otherwise, use placeholder demo images from picsum.photos
    for (let i = 0; i < NUM_IMGS; i++) {
      imgs[i] = loadImage(`https://picsum.photos/${CAR_W}/${CAR_H}/?random?sig=${i}`);
    }
  }
}

// --- Setup Function ---
// Initializes the carousel, sets up the canvas, click events, and buttons.
function setup() {
  // Get the carousel container's size from the HTML
  const carouselEl = document.getElementById('carousel');
  const containerW = carouselEl.offsetWidth;
  const containerH = carouselEl.offsetHeight;

  // Create the drawing canvas inside the carousel div
  canvasEl = createCanvas(containerW, containerH);
  canvasEl.parent('carousel');

  // When the canvas is clicked, go to the photo page for the current image
  if (canvasEl && typeof canvasEl.mouseClicked === 'function') {
    canvasEl.mouseClicked(() => {
      if (!imgs || imgs.length === 0) return;
      // Figure out the correct image path
      let targetPath = null;
      if (typeof IMAGE_PATH_LIST === 'function') {
        const list = IMAGE_PATH_LIST();
        targetPath = list[currentImg];
      } else if (typeof IMAGE_LIST !== 'undefined') {
        let name = IMAGE_LIST[currentImg] || IMAGE_LIST[0];
        try { name = decodeURIComponent(name); } catch (e) { /* ignore */ }
        if (!name.startsWith('http') && !name.startsWith('/') && !name.startsWith('images/')) {
          name = 'images/' + name;
        }
        targetPath = encodeURI(name);
      }
      if (targetPath) {
        // Go to the photo page for the selected image
        window.location.href = `photo.html?img=${targetPath}`;
      }
    });
  }

  // Set up the carousel navigation buttons
  setupButtons();

  // Resize images to fit the carousel
  preprocessImages();

  // Start the auto-advance timer
  resetAutoAdvance();
}

// --- Draw Function ---
// Draws the current image on the canvas. Shows a message if no images are loaded.
function draw() {
  background(220);
  if (imgs.length === 0 || !imgs[currentImg]) {
    // Show a placeholder if no images are loaded
    push();
    fill(100);
    noStroke();
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(18);
    text('No images loaded', width / 2, height / 2);
    pop();
    return;
  }

  // Draw the current image, centered and scaled to fit
  const img = imgs[currentImg];
  const dw = img.width;
  const dh = img.height;
  const dx = (width - dw) / 2;
  const dy = (height - dh) / 2;
  image(img, dx, dy, dw, dh);
}

// --- setupButtons Function ---
// Creates the previous/next buttons and the pagination dots below the carousel.
// You can change the button symbols or add more controls here.
const setupButtons = _ => {
  // Create the controls row
  const controlsBottom = createDiv();
  controlsBottom.addClass('controls-bottom');
  controlsBottom.parent('carousel');

  // Previous button (left arrow)
  previous = createButton('◀');
  previous.addClass('carousel-button');
  previous.parent(controlsBottom);
  previous.mouseClicked(_ => {
    goPrev();
    resetAutoAdvance();
  });

  // Pagination dots (center)
  const pag = createDiv();
  pag.addClass('pagination');
  pag.parent(controlsBottom);

  // Create a dot for each image
  for (let i = 0; i < imgs.length; i++) {
    const d = createDiv();
    d.addClass('dot');
    d.parent(pag);
    // When a dot is clicked, go to that image
    ((idx) => {
      d.mouseClicked(() => {
        currentImg = idx;
        updatePagination();
        resetAutoAdvance();
      });
    })(i);
  }

  // Next button (right arrow)
  next = createButton('▶');
  next.addClass('carousel-button');
  next.parent(controlsBottom);
  next.mouseClicked(_ => {
    goNext();
    resetAutoAdvance();
  });

  // Highlight the current dot
  updatePagination();
};

// --- preprocessImages Function ---
// Resizes images to fit the carousel area, so they display quickly and don't overflow.
function preprocessImages() {
  const canvasW = width;
  const canvasH = height;
  for (let i = 0; i < imgs.length; i++) {
    const img = imgs[i];
    if (!img) continue;
    const sw = img.width;
    const sh = img.height;
    if (!sw || !sh) continue;
    // Scale down if needed
    const scale = Math.min(1, Math.min(canvasW / sw, canvasH / sh));
    if (scale < 1) {
      const newW = Math.max(1, Math.round(sw * scale));
      const newH = Math.max(1, Math.round(sh * scale));
      img.resize(newW, newH);
    }
  }
}

// --- goNext Function ---
// Moves to the next image in the carousel. Wraps to the first image if at the end.
function goNext() {
  if (imgs.length === 0) return;
  if (currentImg < imgs.length - 1) currentImg++;
  else currentImg = 0;
  updatePagination();
}

// --- goPrev Function ---
// Moves to the previous image in the carousel. Wraps to the last image if at the start.
function goPrev() {
  if (imgs.length === 0) return;
  if (currentImg > 0) currentImg--;
  else currentImg = imgs.length - 1;
  updatePagination();
}

// --- updatePagination Function ---
// Highlights the active dot in the pagination row.
function updatePagination() {
  const pag = document.querySelector('.pagination');
  if (!pag) return;
  const dots = pag.querySelectorAll('.dot');
  dots.forEach((dot, i) => {
    if (i === currentImg) dot.classList.add('active');
    else dot.classList.remove('active');
  });
}

// --- resetAutoAdvance Function ---
// Resets the timer that automatically advances the carousel.
function resetAutoAdvance() {
  if (autoAdvanceIntervalId) {
    clearInterval(autoAdvanceIntervalId);
  }
  autoAdvanceIntervalId = setInterval(goNext, AUTO_ADVANCE_MS);
}
