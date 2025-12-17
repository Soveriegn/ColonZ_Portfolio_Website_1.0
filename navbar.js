// Navbar injection script
document.addEventListener('DOMContentLoaded', function() {
  const navbarHTML = `
<nav>
  <ul>
    <li><a href="index.html">Home</a></li>
    <li><a href="about.html">About</a></li>
    <li class="dropdown">
      <a href="portfolio.html" class="dropbtn">Portfolio</a>
      <div class="dropdown-content">
        <!-- populated dynamically from images.js -->
      </div>
    </li>
    <li><a href="contact.html">Contact</a></li>
  </ul>
</nav>
  `;
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    navbarContainer.innerHTML = navbarHTML;
  }
});