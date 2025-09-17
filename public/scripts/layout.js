// Global authentication state - tracks if user is logged in
var isAuthenticated = false;

/**
 * Checks current user authentication status via API call
 * Updates the navigation menu based on authentication result
 */
async function checkAuthStatus(){
    try{
        const response = await fetch('/api/users/current');
        isAuthenticated = response.ok;
    }
    catch(error){
        isAuthenticated = false;
    }

    updateNavigation();
}

/**
 * Dynamically updates the side navigation menu based on authentication status
 * Shows different menu options for authenticated vs. non-authenticated users
 */
function updateNavigation(){
    const sideMenu = document.getElementById('sideMenu');

    if(!sideMenu){
        return;
    }

    if(isAuthenticated){
        sideMenu.innerHTML =
            '<a href="/store.html"><i class="fa-solid fa-store"></i> Store</a>' +
            '<div class="menu-dropdown">' +
            '<a href="javascript:void(0)" onclick="toggleCollections()" class="menu-dropdown-toggle" title="Click to explore collections">' +
            '<i class="fa-solid fa-gem"></i> Collections <i class="fa-solid fa-caret-down dropdown-arrow"></i>' +
            '</a>' +
            '<div class="menu-dropdown-content" id="collectionsDropdown">' +
            '<a href="/collection-hoops.html">Hoop Earrings</a>' +
            '<a href="/collection-bracelets.html">Bracelets</a>' +
            '<a href="/collection-wedding.html">Wedding & Engagement</a>' +
            '</div>' +
            '</div>' +
            '<a href="/cart.html"><i class="fa-solid fa-shopping-cart"></i> Cart</a>' +
            '<a href="/wishlist.html"><i class="fa-solid fa-heart"></i> Wishlist</a>' +
            '<a href="/about.html"><i class="fa-solid fa-info-circle"></i> About</a>' +
            '<a href="/contact.html"><i class="fa-solid fa-envelope"></i> Contact</a>' +
            '<a href="/readme.html"><i class="fa-solid fa-book"></i> README</a>' +
            '<a href="/profile.html"><i class="fa-solid fa-user"></i> Profile</a>' +
            '<a href="/admin.html"><i class="fa-solid fa-cog"></i> Admin</a>' +
            '<button onclick="logout()"><i class="fa-solid fa-sign-out-alt"></i> Logout</button>';
    }
    else{
        sideMenu.innerHTML =
            '<a href="/store.html"><i class="fa-solid fa-store"></i> Store</a>' +
            '<div class="menu-dropdown">' +
            '<a href="javascript:void(0)" onclick="toggleCollections()" class="menu-dropdown-toggle" title="Click to explore collections">' +
            '<i class="fa-solid fa-gem"></i> Collections <i class="fa-solid fa-caret-down dropdown-arrow"></i>' +
            '</a>' +
            '<div class="menu-dropdown-content" id="collectionsDropdown">' +
            '<a href="/collection-hoops.html">Hoop Earrings</a>' +
            '<a href="/collection-bracelets.html">Bracelets</a>' +
            '<a href="/collection-wedding.html">Wedding & Engagement</a>' +
            '</div>' +
            '</div>' +
            '<a href="/login.html"><i class="fa-solid fa-shopping-cart"></i> Cart</a>' +
            '<a href="/login.html"><i class="fa-solid fa-heart"></i> Wishlist</a>' +
            '<a href="/about.html"><i class="fa-solid fa-info-circle"></i> About</a>' +
            '<a href="/contact.html"><i class="fa-solid fa-envelope"></i> Contact</a>' +
            '<a href="/readme.html"><i class="fa-solid fa-book"></i> README</a>' +
            '<a href="/login.html"><i class="fa-solid fa-sign-in-alt"></i> Login</a>' +
            '<a href="/register.html"><i class="fa-solid fa-user-plus"></i> Register</a>';
    }
}

/**
 * Toggles the hamburger menu open/closed state
 * Controls menu button animation, side menu visibility, and overlay
 */
function toggleMenu(){
    const menu = document.getElementById('menu');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');

    if(!menu || !sideMenu || !overlay){
        return;
    }

    menu.classList.toggle('active');
    sideMenu.classList.toggle('active');
    overlay.classList.toggle('active');
}

/**
 * Toggles the Collections dropdown menu in the side navigation
 * Controls dropdown visibility and arrow rotation animation
 */
function toggleCollections(){
    const dropdown = document.getElementById('collectionsDropdown');
    const arrow = document.querySelector('.dropdown-arrow');

    if(dropdown){
        dropdown.classList.toggle('active');
    }

    if(arrow){
        arrow.classList.toggle('rotated');
    }
}

/**
 * Initializes theme settings from localStorage on page load
 * Applies saved dark mode preference and updates theme toggle UI
 */
function initializeTheme(){
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if(themeIcon){
            themeIcon.textContent = '🌙';
        }
        if(themeText){
            themeText.textContent = 'ON';
        }
    } else {
        if(themeIcon){
            themeIcon.textContent = '🌙';
        }
        if(themeText){
            themeText.textContent = 'OFF';
        }
    }
}

/**
 * Toggles between light and dark theme modes
 * Updates localStorage setting and theme toggle button UI
 */
function toggleTheme(){
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');

    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        if(themeIcon){
            themeIcon.textContent = '🌙';
        }
        if(themeText){
            themeText.textContent = 'ON';
        }
    } else {
        localStorage.setItem('theme', 'light');
        if(themeIcon){
            themeIcon.textContent = '🌙';
        }
        if(themeText){
            themeText.textContent = 'OFF';
        }
    }
}

/**
 * Handles user logout by calling the server logout endpoint
 * Reloads the page on successful logout to reset authentication state
 */
async function logout(){
    try{
        const response= await fetch('/logout', {
            method: 'POST'
        });

        const data= await response.json()
        if(data.success){
            window.location.reload();
        }
    }
    catch(error){
        console.error('Logout error: ', error);
    }
}

/**
 * Main initialization function - called when page loads
 * Sets up all layout functionality: theme, auth, scroll, images, and menu overlay
 */
function initializeBaseLayout(){
    initializeTheme();

    // Call checkAuthStatus and ensure navigation is updated
    checkAuthStatus();

    // Fallback: ensure navigation is populated even if auth check fails
    setTimeout(() => {
        const sideMenu = document.getElementById('sideMenu');
        if(sideMenu && sideMenu.innerHTML.trim() === ''){
            console.log('Side menu empty after 1 second, forcing update...');
            updateNavigation();
        }
    }, 1000);

    initializeScrollToTop();
    initializeImageLoading();

    // Close menu when clicking overlay
    const overlay = document.getElementById('menuOverlay');
    if(overlay){
        overlay.addEventListener('click', () => {
            const menu = document.getElementById('menu');
            if(menu && menu.classList.contains('active')){
                toggleMenu();
            }
        });
    }
}

/**
 * Initializes image loading states for smooth fade-in animations
 * Adds 'loaded' class to images for CSS transition effects
 */
function initializeImageLoading(){
    const images = document.querySelectorAll('.product-image img, .hero-image img, .photo-item img');
    images.forEach(img => {
        if(img.complete && img.naturalHeight !== 0){
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
        }
    });
}

/**
 * Creates and manages the scroll-to-top button
 * Button appears after scrolling 300px down the page
 */
function initializeScrollToTop(){
    // Create scroll to top button if it doesn't exist
    if(!document.getElementById('scrollToTop')){
        const scrollButton = document.createElement('button');
        scrollButton.id = 'scrollToTop';
        scrollButton.className = 'scroll-to-top';
        scrollButton.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        scrollButton.title = 'Scroll to top';
        scrollButton.addEventListener('click', scrollToTop);
        document.body.appendChild(scrollButton);
    }

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        const scrollButton = document.getElementById('scrollToTop');
        if(scrollButton){
            if(window.pageYOffset > 300){
                scrollButton.classList.add('visible');
            } else {
                scrollButton.classList.remove('visible');
            }
        }
    });
}

/**
 * Smoothly scrolls to the top of the page
 * Used by the scroll-to-top button
 */
function scrollToTop(){
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function revealPhotoItemsOnScroll() {
    const items = document.querySelectorAll('.photo-item');
    const trigger = window.innerHeight * 0.9;

    items.forEach(item => {
        const boxTop = item.getBoundingClientRect().top;
        if (boxTop < trigger) {
            item.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', revealPhotoItemsOnScroll);
document.addEventListener('DOMContentLoaded', revealPhotoItemsOnScroll);
