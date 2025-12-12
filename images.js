// Image List Configuration
// Use relative paths pointing to an `images/` folder inside the project
// Place your image files in `images/` and name them accordingly (e.g. image1.jpg)
// Change IMAGE_LIST to add, remove, or reorder images for the Digital Art Portfolio section
const IMAGE_LIST = [
	'image0.jpg',
	'image1.jpg',
	'image2.jpg',
	'image3.jpg',
	'image4.jpg',
	'image5.jpg',
	'image6.jpg',
	'image7.jpg',
	'image8.jpg',
	'Image%209.jpg', //"image9.jpg"
	'image10.jpg',
	'image%2011.jpg', //"image11.jpg"
	'image12.jpg',
	"image13.jpg",
];

// Placeholder lists for other sections
// Change CODE_SNIPPETS to add/remove placeholder images for the Code Snippets section
const CODE_SNIPPETS = [
	'code1.jpg',
	'code2.jpg',
	'code3.jpg',
	'code4.jpg',
	'code5.jpg'
];

// Change VIDEOS to add/remove placeholder images for the Videos section
const VIDEOS = [
	'video1.jpg',
	'video2.jpg',
	'video3.jpg',
	'video4.jpg',
	'video5.jpg'
];

// Change MODELS_3D to add/remove placeholder images for the 3D Models subsection
const MODELS_3D = [
	'3d1.jpg',
	'3d2.jpg',
	'3d3.jpg',
	'3d4.jpg',
	'3d5.jpg'
];

// Change MODELS_2D to add/remove placeholder images for the 2D Models subsection
const MODELS_2D = [
	'2d1.jpg',
	'2d2.jpg',
	'2d3.jpg',
	'2d4.jpg',
	'2d5.jpg'
];

// Change AUDIO to add/remove placeholder images for the Audio subsection
const AUDIO = [
	'audio1.jpg',
	'audio2.jpg',
	'audio3.jpg',
	'audio4.jpg',
	'audio5.jpg'
];

// Change ANIMATION to add/remove placeholder images for the Animation subsection
const ANIMATION = [
	'anim1.jpg',
	'anim2.jpg',
	'anim3.jpg',
	'anim4.jpg',
	'anim5.jpg'
];

// Helper Functions

// fullImagePath Function: normalize and return the file path to use in <img src>
function fullImagePath(name) {
	if (!name) return name;
	// Some entries may be percent-encoded (e.g. 'Image%209.jpg')
	let decoded = name;
	try { decoded = decodeURIComponent(name); } catch (e) { decoded = name; }

	// If it's already an absolute or images/ path, return as-is (but ensure no leading ./)
	if (decoded.startsWith('http') || decoded.startsWith('/') || decoded.startsWith('images/')) {
		return decoded.replace(/^\.\//, '');
	}

	return 'images/' + decoded;
}

// IMAGE_PATH_LIST Function: Return an array of usable paths for src attributes (encoded so browsers can fetch)
function IMAGE_PATH_LIST() {
	return IMAGE_LIST.map(name => encodeURI(fullImagePath(name)));
}

// Dropdown Population

// populatePortfolioDropdown Function: Populate any `.dropdown-content` element with links for each image
// Change the sections array to add/remove/modify dropdown links for portfolio sections
function populatePortfolioDropdown() {
	const lists = document.querySelectorAll('.dropdown-content');
	if (!lists) return;
	const sections = [
		{ href: 'portfolio.html#digital-art', text: 'Digital Art Portfolio' },
		{ href: 'portfolio.html#code-snippets', text: 'Code Snippets' },
		{ href: 'portfolio.html#videos', text: 'Videos' },
		{ href: 'portfolio.html#assets', text: 'Assets' }
	];
	lists.forEach(container => {
		container.innerHTML = '';
		sections.forEach(s => {
			const a = document.createElement('a');
			a.href = s.href;
			a.textContent = s.text;
			container.appendChild(a);
		});
	});
}

// Initialization
if (typeof window !== 'undefined') {
	window.addEventListener('DOMContentLoaded', () => {
		try { populatePortfolioDropdown(); } catch (e) { /* ignore if DOM not ready */ }
	});
}