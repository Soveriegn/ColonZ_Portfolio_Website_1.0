// Use relative paths pointing to an `images/` folder inside the project
// Place your image files in `images/` and name them accordingly (e.g. image1.jpg)
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
	'Image%209.jpg',
	'image10.jpg',
	'image%2011.jpg',
	'image12.jpg'
];

// Helper: normalize and return the file path to use in <img src>
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

// Return an array of usable paths for src attributes (encoded so browsers can fetch)
function IMAGE_PATH_LIST() {
	return IMAGE_LIST.map(name => encodeURI(fullImagePath(name)));
}

// Populate any `.dropdown-content` element with links for each image
function populatePortfolioDropdown() {
	// Replace per-image links with three section links:
	// - Digital Art Portfolio
	// - Code Snippets
	// - Videos
	const lists = document.querySelectorAll('.dropdown-content');
	if (!lists) return;
	const sections = [
		{ href: 'portfolio.html#digital-art', text: 'Digital Art Portfolio' },
		{ href: 'portfolio.html#code-snippets', text: 'Code Snippets' },
		{ href: 'portfolio.html#videos', text: 'Videos' }
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

if (typeof window !== 'undefined') {
	window.addEventListener('DOMContentLoaded', () => {
		try { populatePortfolioDropdown(); } catch (e) { /* ignore if DOM not ready */ }
	});
}