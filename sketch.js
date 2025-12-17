// Global Variables
const NUM_IMGS = 5, // number of images in the carousel
  imgs = []; // array to hold loaded images
let currentImg = 0; // current image index
const CAR_W = 640, CAR_H = 360; // carousel width and height
let canvasEl, controls; // canvas element and controls
let autoAdvanceIntervalId = null; // auto-advance timer ID
const AUTO_ADVANCE_MS = 30 * 1000; // 30 seconds before auto-advancing

// desired aspect ratio (width / height) -AI 
//const DESIRED_ASPECT = CAR_W / CAR_H;

// Preload Function
function preload() {
  // If an external `images.js` defines `IMAGE_LIST`, load those paths. - Meant for testing, inital carousel creation assitance from W3Schools
  //Reuseable code for loading images from external sources from other porfolio sources.
  if (typeof IMAGE_PATH_LIST === 'function') { // if IMAGE_PATH_LIST is a function, use it to get image paths
    const list = IMAGE_PATH_LIST(); // get list of image paths
    for (let i = 0; i < list.length; i++) { // load each image
      imgs[i] = loadImage(list[i]); // load image from path
    }
  } else if (typeof IMAGE_LIST !== 'undefined' && Array.isArray(IMAGE_LIST) && IMAGE_LIST.length > 0) { // if IMAGE_LIST is defined, use those images
    for (let i = 0; i < IMAGE_LIST.length; i++) { // load each image
      imgs[i] = loadImage(IMAGE_LIST[i]); // load image from path
    }
  } else {
    // fallback demo images from first instance of carousel before improvements
    for (let i = 0; i < NUM_IMGS; i++) { // load placeholder images from picsum.photos
      imgs[i] = loadImage(`https://picsum.photos/${CAR_W}/${CAR_H}/?random?sig=${i}`); // load random image- us this to randomize demo images
    }
  }
}

// Setup Function
function setup() {
  // Get carousel container dimensions
  const carouselEl = document.getElementById('carousel'); // Get carousel div
  const containerW = carouselEl.offsetWidth; // Get container width
  const containerH = carouselEl.offsetHeight; // Get container height

  canvasEl = createCanvas(containerW, containerH); // Create canvas with container dimensions
  canvasEl.parent('carousel'); // Attach canvas to carousel div

  // Clickable Convas: opens the photo page for the currently shown image
  if (canvasEl && typeof canvasEl.mouseClicked === 'function') { // if canvas supports mouseClicked
    canvasEl.mouseClicked(() => { // on canvas click
      if (!imgs || imgs.length === 0) return; //If there are no images it terminates the function early
      // determine path for current image. Prefer IMAGE_PATH_LIST if available 
      let targetPath = null;
      if (typeof IMAGE_PATH_LIST === 'function') {
        const list = IMAGE_PATH_LIST();
        targetPath = list[currentImg];
      } else if (typeof IMAGE_LIST !== 'undefined') {
        // reconstruct full path similar to portfolio logic
        let name = IMAGE_LIST[currentImg] || IMAGE_LIST[0];
        try { name = decodeURIComponent(name); } catch (e) { /* ignore */ }
        if (!name.startsWith('http') && !name.startsWith('/') && !name.startsWith('images/')) {
          name = 'images/' + name;
        }
        targetPath = encodeURI(name);
      }

      if (targetPath) {
        window.location.href = `photo.html?img=${encodeURIComponent(targetPath)}`;
      }
    });
  }

  setupButtons(); // setup carousel buttons and pagination
  preprocessImages(); // preprocess images to fit carousel (needed for performance and proper display given my images different sizes)
  // start auto-advance timer
  if (autoAdvanceIntervalId) clearInterval(autoAdvanceIntervalId); //
  autoAdvanceIntervalId = setInterval(goNext, AUTO_ADVANCE_MS); // auto-advance every 30 seconds

  // clear timer on page unload
  window.addEventListener('beforeunload', () => {
    if (autoAdvanceIntervalId) clearInterval(autoAdvanceIntervalId);
  });
}

// Draw Function
function draw() {
  background(220);
  if (imgs.length === 0 || !imgs[currentImg]) {
    // placeholder when nothing is loaded
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

  // draw the current image scaled to fit the carousel while preserving aspect
  const img = imgs[currentImg];
  const dw = img.width;
  const dh = img.height;
  const dx = (width - dw) / 2;
  const dy = (height - dh) / 2;

  // draw at the precomputed (possibly resized) dimensions, centered
  image(img, dx, dy, dw, dh);
}

// Setup Buttons Function
const setupButtons = _ => {
  // create bottom controls row that contains prev button, pagination, next button
  const controlsBottom = createDiv();
  controlsBottom.addClass('controls-bottom');
  controlsBottom.parent('carousel');

  // previous button (left)
  previous = createButton('◀');
  previous.addClass('carousel-button');
  previous.parent(controlsBottom);
  previous.mouseClicked(_ => {
    goPrev();
    resetAutoAdvance();
  });

  // pagination (center)
  const pag = createDiv();
  pag.addClass('pagination');
  pag.parent(controlsBottom);

  // create dot elements for each image (will be updated as images load)
  for (let i = 0; i < imgs.length; i++) {
    const d = createDiv();
    d.addClass('dot');
    d.parent(pag);
    // closure to capture index
    ((idx) => {
      d.mouseClicked(() => {
        currentImg = idx;
        updatePagination();
        resetAutoAdvance();
      });
    })(i);
  }

  // next button (right)
  next = createButton('▶');
  next.addClass('carousel-button');
  next.parent(controlsBottom);
  next.mouseClicked(_ => {
    goNext();
    resetAutoAdvance();
  });

  updatePagination();
};

// Preprocess Images Function
// Wire the HTML file-input to load user images
// Note: image list should be provided in `images.js` as:
// const IMAGE_LIST = ['images/photo1.jpg', 'images/photo2.jpg', ...];

// Downscale large images to fit the carousel while preserving aspect ratio.
// This modifies loaded p5.Image objects to keep rendering fast and avoid
// drawing extremely large bitmaps every frame.
function preprocessImages() {
  // Use current canvas dimensions (which match the carousel container size)
  const canvasW = width;
  const canvasH = height;
  
  for (let i = 0; i < imgs.length; i++) {
    const img = imgs[i];
    if (!img) continue;

    // ensure the image has loaded metadata
    const sw = img.width;
    const sh = img.height;
    if (!sw || !sh) continue;

    // compute scale so the image fits inside the canvas (no cropping)
    const scale = Math.min(1, Math.min(canvasW / sw, canvasH / sh));
    if (scale < 1) {
      const newW = Math.max(1, Math.round(sw * scale));
      const newH = Math.max(1, Math.round(sh * scale));
      img.resize(newW, newH);
    }
  }
}

// Navigation Functions

// goNext Function: Move to the next image with wrapping
function goNext() {
  if (imgs.length === 0) return;
  if (currentImg < imgs.length - 1) currentImg++;
  else currentImg = 0;
  updatePagination();
}

// goPrev Function: Move to the previous image with wrapping
function goPrev() {
  if (imgs.length === 0) return;
  if (currentImg > 0) currentImg--;
  else currentImg = imgs.length - 1;
  updatePagination();
}

// updatePagination Function: Update the active dot in pagination
function updatePagination() {
  const pag = document.querySelector('.pagination');
  if (!pag) return;
  const dots = pag.querySelectorAll('.dot');
  dots.forEach((dot, i) => {
    if (i === currentImg) dot.classList.add('active');
    else dot.classList.remove('active');
  });
}

// resetAutoAdvance Function: Reset the auto-advance timer
function resetAutoAdvance() {
  if (autoAdvanceIntervalId) {
    clearInterval(autoAdvanceIntervalId);
  }
  autoAdvanceIntervalId = setInterval(goNext, AUTO_ADVANCE_MS);
}