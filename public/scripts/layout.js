// Global authentication state - tracks if user is logged in
let isAuthenticated = false;
let currentUser = null;

/**
 * Checks current user authentication status via API call
 * Updates the navigation menu based on authentication result
 * Also fetches cart and wishlist counts if authenticated
 */
async function checkAuthStatus(){
    try{
        const response = await fetch('/api/users/current');
        isAuthenticated = response.ok;

        if(isAuthenticated){
            // Store user data
            currentUser = await response.json();
            // Fetch cart and wishlist counts
            await window.updateCartAndWishlistCounts();
        } else {
            currentUser = null;
        }
    }
    catch(error){
        console.error('Auth check failed:', error);
        isAuthenticated = false;
        currentUser = null;
    }

    updateNavigation();
    updateUserIndicator();
}

/**
 * Helper function to determine if a menu item should be marked as active
 */
function isActivePage(href) {
    const currentPath = window.location.pathname;

    // Handle root/store pages
    if (href === '/store.html' && (currentPath === '/' || currentPath === '/store.html' || currentPath === '/products.html')) {
        return true;
    }

    // Handle collection pages
    if (href.includes('collection-') && currentPath.includes('collection-')) {
        return currentPath === href;
    }

    // For all other pages, exact match
    return currentPath === href;
}

/**
 * Helper function to create menu link with active state
 */
function createMenuLink(href, icon, text) {
    const activeClass = isActivePage(href) ? ' class="active"' : '';
    return `<a href="${href}"${activeClass}><i class="${icon}"></i> ${text}</a>`;
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

    // Check if we're on the login or register page - these should always show non-auth menu
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath === '/login.html' || currentPath === '/register.html';

    if(isAuthenticated && !isAuthPage){
        // Build the base menu for authenticated users
        let menuHTML =
            createMenuLink('/store.html', 'fa-solid fa-store', 'Store') +
            '<div class="menu-dropdown">' +
            '<a href="javascript:void(0)" onclick="toggleCollections()" class="menu-dropdown-toggle" aria-expanded="false">' +
            '<i class="fa-solid fa-gem"></i> Collections <span class="dropdown-arrow"></span>' +
            '</a>' +
            '<div class="menu-dropdown-content" id="collectionsDropdown">' +
            createMenuLink('/collection-hoops.html', '', 'Hoop Earrings') +
            createMenuLink('/collection-bracelets.html', '', 'Bracelets') +
            createMenuLink('/collection-wedding.html', '', 'Wedding & Engagement') +
            '</div>' +
            '</div>' +
            createMenuLink('/cart.html', 'fa-solid fa-shopping-cart', 'Cart') +
            createMenuLink('/wishlist.html', 'fa-solid fa-heart', 'Wishlist') +
            createMenuLink('/my-items.html', 'fa-solid fa-box', 'My Items') +
            createMenuLink('/about.html', 'fa-solid fa-info-circle', 'About') +
            createMenuLink('/contact.html', 'fa-solid fa-envelope', 'Contact') +
            createMenuLink('/readme.html', 'fa-solid fa-book', 'README') +
            createMenuLink('/llm.html', 'fa-solid fa-robot', 'AI Documentation') +
            createMenuLink('/profile.html', 'fa-solid fa-user', 'Profile');

        // Only add Admin link if user is admin
        if(currentUser && currentUser.username === 'admin'){
            menuHTML += createMenuLink('/admin.html', 'fa-solid fa-cog', 'Admin');
        }

        menuHTML += '<button onclick="logout()"><i class="fa-solid fa-sign-out-alt"></i> Logout</button>';

        sideMenu.innerHTML = menuHTML;
    }
    else{
        sideMenu.innerHTML =
            createMenuLink('/store.html', 'fa-solid fa-store', 'Store') +
            '<div class="menu-dropdown">' +
            '<a href="javascript:void(0)" onclick="toggleCollections()" class="menu-dropdown-toggle" aria-expanded="false">' +
            '<i class="fa-solid fa-gem"></i> Collections <span class="dropdown-arrow"></span>' +
            '</a>' +
            '<div class="menu-dropdown-content" id="collectionsDropdown">' +
            createMenuLink('/collection-hoops.html', '', 'Hoop Earrings') +
            createMenuLink('/collection-bracelets.html', '', 'Bracelets') +
            createMenuLink('/collection-wedding.html', '', 'Wedding & Engagement') +
            '</div>' +
            '</div>' +
            '<a href="/login.html"><i class="fa-solid fa-shopping-cart"></i> Cart</a>' +
            '<a href="/login.html"><i class="fa-solid fa-heart"></i> Wishlist</a>' +
            createMenuLink('/about.html', 'fa-solid fa-info-circle', 'About') +
            createMenuLink('/contact.html', 'fa-solid fa-envelope', 'Contact') +
            createMenuLink('/readme.html', 'fa-solid fa-book', 'README') +
            createMenuLink('/llm.html', 'fa-solid fa-robot', 'AI Documentation') +
            createMenuLink('/login.html', 'fa-solid fa-sign-in-alt', 'Login') +
            createMenuLink('/register.html', 'fa-solid fa-user-plus', 'Register');
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
 * Force close menu - for navigation links
 */
function closeMenu(){
    const menu = document.getElementById('menu');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');

    if(menu) menu.classList.remove('active');
    if(sideMenu) sideMenu.classList.remove('active');
    if(overlay) overlay.classList.remove('active');
}

/**
 * Toggles the Collections dropdown menu in the side navigation
 * Controls dropdown visibility and arrow rotation animation
 */
function toggleCollections(){
    const dropdown = document.getElementById('collectionsDropdown');
    const toggle = document.querySelector('.menu-dropdown-toggle');

    if(dropdown){
        dropdown.classList.toggle('active');
    }

    if(toggle){
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    }
}

/**
 * Initializes theme settings from localStorage on page load
 * This function checks if theme.js is loaded, and if not, provides a fallback
 * implementation that applies saved dark mode preference and updates theme toggle UI
 */
function initializeTheme(){
    // If theme.js is handling this functionality, don't duplicate it
    if (window.themeInitialized) {
        return;
    }

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
 * This is a fallback implementation if theme.js isn't loaded
 * Updates localStorage setting and theme toggle button UI
 */
function toggleTheme(){
    // If theme.js is handling this functionality, let it take precedence
    if (window.themeToggleHandler) {
        window.themeToggleHandler();
        return;
    }

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
 * Updates the user indicator in the header to show login status
 * Displays floating profile circle when authenticated, hides when not authenticated
 */
function updateUserIndicator(){
    let profileCircle = document.getElementById('profileCircle');

    if(!profileCircle){
        // Create floating profile circle if it doesn't exist
        profileCircle = document.createElement('a');
        profileCircle.id = 'profileCircle';
        profileCircle.className = 'profile-circle';
        profileCircle.href = '/profile.html';
        profileCircle.title = `My Profile${currentUser ? ` (${currentUser.username})` : ''}`;
        document.body.appendChild(profileCircle);
    }

    if(isAuthenticated && currentUser){
        // Show user icon instead of first letter
        profileCircle.innerHTML = '<i class="fa-solid fa-user"></i>';
        profileCircle.title = `My Profile (${currentUser.username})`;
        profileCircle.style.display = 'flex';
    } else {
        profileCircle.style.display = 'none';
    }
}

/**
 * Handles user logout by calling the server logout endpoint
 * Redirects to store page on successful logout instead of just reloading
 */
async function logout(){
    try{
        const response= await fetch('/logout', {
            method: 'POST'
        });

        const data = await response.json();
        if(data.success){
            // Redirect to store instead of just reloading
            window.location.href = '/store.html';
        }
    }
    catch(error){
        console.error('Logout failed:', error);
        // Fallback: still redirect to store even if there's an error
        window.location.href = '/store.html';
    }
}

// Ensure functions are globally accessible
window.toggleMenu = toggleMenu;
window.initializeBaseLayout = initializeBaseLayout;
window.toggleTheme = toggleTheme;
window.toggleCollections = toggleCollections;
window.closeMenu = closeMenu;
window.logout = logout;

/**
 * Main initialization function - called when page loads
 * Sets up all layout functionality: theme, auth, scroll, images, and menu overlay
 */
function initializeBaseLayout(){
    // Load theme.js script if it's not already loaded
    if (!document.getElementById('theme-js-script')) {
        const themeScript = document.createElement('script');
        themeScript.id = 'theme-js-script';
        themeScript.src = '/scripts/theme.js';
        themeScript.async = true;
        document.head.appendChild(themeScript);
    }

    initializeTheme();

    const menuButton = document.getElementById('menu');
    const themeToggle = document.getElementById('themeToggle');
    const overlay = document.getElementById('menuOverlay');

    // Move hamburger menu button out of header
    if(menuButton && menuButton.parentElement !== document.body){
        // Preserve onclick attribute if it exists
        const onclickAttr = menuButton.getAttribute('onclick');
        if(overlay && overlay.parentElement){
            overlay.parentElement.insertBefore(menuButton, overlay);
        } else {
            document.body.insertBefore(menuButton, document.body.firstChild);
        }
        // Restore onclick if it was present
        if(onclickAttr){
            menuButton.setAttribute('onclick', onclickAttr);
        }
    }

    // Move theme toggle button out of header to be a floating button
    if(themeToggle && themeToggle.parentElement !== document.body){
        // Preserve onclick attribute if it exists
        const onclickAttr = themeToggle.getAttribute('onclick');
        document.body.appendChild(themeToggle);
        // Restore onclick if it was present
        if(onclickAttr){
            themeToggle.setAttribute('onclick', onclickAttr);
        }
    }

    // Add event listeners for menu and theme buttons
    if(menuButton){
        // Ensure onclick is set after moving the button
        menuButton.onclick = toggleMenu;
    }
    if(themeToggle){
        // Ensure onclick is set after moving the button
        themeToggle.onclick = toggleTheme;
    }

    // Call checkAuthStatus and ensure navigation is updated
    checkAuthStatus();

    // Fallback: ensure navigation is populated even if auth check fails
    setTimeout(() => {
        const sideMenu = document.getElementById('sideMenu');
        if(sideMenu && sideMenu.innerHTML.trim() === ''){
            updateNavigation();
        }
    }, 1000);

    initializeScrollToTop();
    initializeImageLoading();

    // Close menu when clicking overlay
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
/**
 * Updates cart and wishlist count badges by fetching from server
 */
window.updateCartAndWishlistCounts = async function updateCartAndWishlistCounts(){
    // Only fetch if user is authenticated
    if(!isAuthenticated) {
        return;
    }

    try{
        // Fetch cart count
        const cartResponse = await fetch('/api/cart');
        if(cartResponse.ok){
            const cartData = await cartResponse.json();

            // Handle both array format and object.items format
            const items = Array.isArray(cartData) ? cartData : cartData.items;
            const cartCount = items ? items.reduce((total, item) => total + (item.quantity || 1), 0) : 0;

            // Always update with real server data
            updateBadge('cart-count', cartCount);

            localStorage.setItem('cartCount', cartCount);
        } else if(cartResponse.status === 401) {
            return;
        }

        // Fetch wishlist count
        const wishlistResponse = await fetch('/api/wishlist');
        if(wishlistResponse.ok){
            const wishlistData = await wishlistResponse.json();

            // Handle both array format and object.items format
            const wishlistItems = Array.isArray(wishlistData) ? wishlistData : wishlistData.items;
            const wishlistCount = wishlistItems ? wishlistItems.length : 0;

            // Always update with real server data
            updateBadge('wishlist-count', wishlistCount);
            localStorage.setItem('wishlistCount', wishlistCount);
        } else if(wishlistResponse.status === 401) {
            return;
        }
    }
    catch(error){
        console.error('Failed to update counts:', error);
        // Don't override existing values on error
    }
};

/**
 * Updates a badge element with a count
 * Hides badge if count is 0
 */
function updateBadge(badgeId, count){
    const badge = document.getElementById(badgeId);
    if(badge){
        const numCount = parseInt(count) || 0;
        badge.textContent = numCount;

        // Update badge content and let CSS handle visibility
        badge.textContent = numCount > 0 ? numCount.toString() : '';

        // Remove any inline styles and let CSS classes handle styling
        badge.removeAttribute('style');
        badge.classList.remove('hidden');
    }
}

/**
 * Force refresh badges from server (call from console)
 */
window.refreshBadges = function() {
    if(typeof window.updateCartAndWishlistCounts === 'function') {
        window.updateCartAndWishlistCounts();
    }
};


document.addEventListener('DOMContentLoaded', () => {
    revealPhotoItemsOnScroll();

    // Don't initialize with 0 values - let the test setup handle it

    // Update badges after a slight delay to ensure DOM is ready
    setTimeout(() => {
        // Skip the initial update that was causing 0 values

        // Initialize badges with real server data

        // Clear test mode
        localStorage.removeItem('testMode');

        // Don't initialize with 0 - let server update with real values
        // If user is authenticated, server will update badges
        // If not authenticated, badges will remain hidden (empty)


        // Don't set test values - let server provide real data

        // Wait for auth check to complete before fetching real counts
        setTimeout(() => {
            if(typeof window.updateCartAndWishlistCounts === 'function') {
                window.updateCartAndWishlistCounts();
            }
        }, 1000);
    }, 100);
});