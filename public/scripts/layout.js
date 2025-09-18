// Global authentication state - tracks if user is logged in
var isAuthenticated = false;
var currentUser = null;

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
            await updateCartAndWishlistCounts();
        } else {
            currentUser = null;
        }
    }
    catch(error){
        console.log('Auth check error:', error);
        isAuthenticated = false;
        currentUser = null;
    }

    updateNavigation();
    updateUserIndicator();
}

/**
 * Dynamically updates the side navigation menu based on authentication status
 * Shows different menu options for authenticated vs. non-authenticated users
 */
function updateNavigation(){
    const sideMenu = document.getElementById('sideMenu');

    console.log('updateNavigation called, sideMenu found:', !!sideMenu);
    console.log('isAuthenticated:', isAuthenticated);

    if(!sideMenu){
        console.error('Side menu element not found!');
        return;
    }

    if(isAuthenticated){
        sideMenu.innerHTML =
            '<a href="/store.html"><i class="fa-solid fa-store"></i> Store</a>' +
            '<div class="menu-dropdown">' +
            '<a href="javascript:void(0)" onclick="toggleCollections()" class="menu-dropdown-toggle" aria-expanded="false">' +
            '<i class="fa-solid fa-gem"></i> Collections <span class="dropdown-arrow"></span>' +
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
            '<a href="javascript:void(0)" onclick="toggleCollections()" class="menu-dropdown-toggle" aria-expanded="false">' +
            '<i class="fa-solid fa-gem"></i> Collections <span class="dropdown-arrow"></span>' +
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
    console.log('toggleMenu called!');
    const menu = document.getElementById('menu');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');

    console.log('Menu elements found:', {menu: !!menu, sideMenu: !!sideMenu, overlay: !!overlay});

    if(!menu || !sideMenu || !overlay){
        console.error('Missing menu elements!');
        return;
    }

    console.log('Before toggle - menu active:', menu.classList.contains('active'));
    menu.classList.toggle('active');
    sideMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    console.log('After toggle - menu active:', menu.classList.contains('active'));
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
 * Updates the user indicator in the header to show login status
 * Displays username when authenticated, hides when not authenticated
 */
function updateUserIndicator(){
    let userIndicator = document.getElementById('userIndicator');

    if(!userIndicator){
        // Create user indicator if it doesn't exist
        userIndicator = document.createElement('div');
        userIndicator.id = 'userIndicator';
        userIndicator.className = 'user-indicator';
        document.body.appendChild(userIndicator);
    }

    if(isAuthenticated && currentUser){
        userIndicator.innerHTML = `
            <i class="fa-solid fa-user"></i>
            <span>Welcome, ${currentUser.username}</span>
        `;
        userIndicator.style.display = 'flex';
    } else {
        userIndicator.style.display = 'none';
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

// Ensure functions are globally accessible
window.toggleMenu = toggleMenu;
window.initializeBaseLayout = initializeBaseLayout;
window.toggleTheme = toggleTheme;
window.toggleCollections = toggleCollections;
window.closeMenu = closeMenu;

/**
 * Main initialization function - called when page loads
 * Sets up all layout functionality: theme, auth, scroll, images, and menu overlay
 */
function initializeBaseLayout(){
    initializeTheme();

    const menuButton = document.getElementById("menu");
    const themeToggle = document.getElementById("themeToggle");
    const overlay = document.getElementById("menuOverlay");

    // Move hamburger menu button out of header
    if(menuButton && menuButton.parentElement !== document.body){
        if(overlay && overlay.parentElement){
            overlay.parentElement.insertBefore(menuButton, overlay);
        } else {
            document.body.insertBefore(menuButton, document.body.firstChild);
        }
    }

    // Move theme toggle button out of header to be a floating button
    if(themeToggle && themeToggle.parentElement !== document.body){
        document.body.appendChild(themeToggle);
    }

    // Add event listeners for menu and theme buttons
    console.log('Adding event listeners:', {menuButton: !!menuButton, themeToggle: !!themeToggle});
    if(menuButton){
        console.log('Adding click listener to menu button');
        menuButton.addEventListener('click', toggleMenu);
        // Also add backup event listener
        menuButton.onclick = toggleMenu;
    } else {
        console.error('Menu button not found!');
    }
    if(themeToggle){
        console.log('Adding click listener to theme toggle');
        themeToggle.addEventListener('click', toggleTheme);
        // Also add backup event listener
        themeToggle.onclick = toggleTheme;
    } else {
        console.error('Theme toggle not found!');
    }

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
        console.log('=== CART API RESPONSE ===');
        console.log('Cart response status:', cartResponse.status);
        if(cartResponse.ok){
            const cartData = await cartResponse.json();
            console.log('Cart data from server:', cartData);

            // Handle both array format and object.items format
            const items = Array.isArray(cartData) ? cartData : cartData.items;
            console.log('Cart items:', items);
            const cartCount = items ? items.reduce((total, item) => total + (item.quantity || 1), 0) : 0;
            console.log('Calculated cart count:', cartCount);

            // Always update with real server data
            updateBadge('cart-count', cartCount);
            localStorage.setItem('cartCount', cartCount);
            console.log(`Updated cart badge to: ${cartCount}`);
        } else if(cartResponse.status === 401) {
            console.log('Cart fetch: User not authenticated');
            return;
        }

        // Fetch wishlist count
        const wishlistResponse = await fetch('/api/wishlist');
        if(wishlistResponse.ok){
            const wishlistData = await wishlistResponse.json();
            console.log('Wishlist data from server:', wishlistData);

            // Handle both array format and object.items format
            const wishlistItems = Array.isArray(wishlistData) ? wishlistData : wishlistData.items;
            const wishlistCount = wishlistItems ? wishlistItems.length : 0;

            // Always update with real server data
            updateBadge('wishlist-count', wishlistCount);
            localStorage.setItem('wishlistCount', wishlistCount);
            console.log(`Updated wishlist badge to: ${wishlistCount}`);
        } else if(wishlistResponse.status === 401) {
            console.log('Wishlist fetch: User not authenticated');
            return;
        }
    }
    catch(error){
        console.error('Error updating counts:', error);
        // Don't override existing values on error, just log it
    }
}

/**
 * Updates a badge element with a count
 * Hides badge if count is 0
 */
function updateBadge(badgeId, count){
    const badge = document.getElementById(badgeId);
    if(badge){
        const numCount = parseInt(count) || 0;
        badge.textContent = numCount;
        console.log(`Updating badge ${badgeId} with count ${numCount}`); // Debug log

        // Force remove the :empty state by setting content first
        badge.innerHTML = numCount.toString();

        // Always show badge for debugging
        badge.style.cssText = 'position: absolute; top: -6px; right: -6px; min-width: 20px; height: 20px; background: #b8866a; color: white; display: flex !important; align-items: center; justify-content: center; border-radius: 10px; font-size: 11px; font-weight: 700; z-index: 1000; visibility: visible !important; opacity: 1 !important;';
        badge.classList.remove('hidden');
        console.log(`=== BADGE UPDATE ===`);
        console.log(`Badge ${badgeId}: count=${numCount}, element found=${!!badge}`);
        console.log(`Badge element:`, badge);
    } else {
        console.log(`Badge element ${badgeId} not found`); // Debug log
    }
}

/**
 * Force refresh badges from server (call from console)
 */
window.refreshBadges = function() {
    if(typeof updateCartAndWishlistCounts === 'function') {
        updateCartAndWishlistCounts();
        console.log('Badges refreshed from server');
    }
}

/**
 * Debug function to check element existence and force visibility
 */
window.debugElements = function() {
    console.log('=== DEBUGGING ELEMENTS ===');

    // Check badges
    const cartBadge = document.getElementById('cart-count');
    const wishlistBadge = document.getElementById('wishlist-count');

    console.log('Cart badge element:', cartBadge);
    console.log('Wishlist badge element:', wishlistBadge);

    if(cartBadge) {
        cartBadge.innerHTML = '5';
        cartBadge.style.cssText = 'position: absolute; top: -6px; right: -6px; min-width: 20px; height: 20px; background: red; color: white; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 11px; font-weight: 700; z-index: 1000;';
        console.log('Forced cart badge styling');
    }

    if(wishlistBadge) {
        wishlistBadge.innerHTML = '3';
        wishlistBadge.style.cssText = 'position: absolute; top: -6px; right: -6px; min-width: 20px; height: 20px; background: red; color: white; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 11px; font-weight: 700; z-index: 1000;';
        console.log('Forced wishlist badge styling');
    }

    // Check dropdown arrow
    const dropdownArrows = document.querySelectorAll('.dropdown-arrow');
    console.log('Found dropdown arrows:', dropdownArrows);

    dropdownArrows.forEach((arrow, index) => {
        console.log(`Arrow ${index} content:`, arrow.textContent);
        console.log(`Arrow ${index} innerHTML:`, arrow.innerHTML);
    });

    // Also check the Collections menu
    const collectionsToggle = document.querySelector('.menu-dropdown-toggle');
    console.log('Collections toggle element:', collectionsToggle);

    if(collectionsToggle) {
        console.log('Collections toggle HTML:', collectionsToggle.innerHTML);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    revealPhotoItemsOnScroll();

    // Don't initialize with 0 values - let the test setup handle it
    console.log('DOM loaded - skipping initial badge update to avoid 0 values');

    // Update badges after a slight delay to ensure DOM is ready
    setTimeout(() => {
        // Skip the initial update that was causing 0 values
        console.log('Skipping initial updateBadge calls');

        // Initialize badges with real server data
        console.log('=== BADGE INITIALIZATION ===');
        console.log('Loading real cart and wishlist counts from server...');

        // Clear test mode
        localStorage.removeItem('testMode');

        // Don't initialize with 0 - let server update with real values
        // If user is authenticated, server will update badges
        // If not authenticated, badges will remain hidden (empty)

        // Check if dropdown arrows exist
        setTimeout(() => {
            const arrows = document.querySelectorAll('.dropdown-arrow');
            const toggle = document.querySelector('.menu-dropdown-toggle');
            console.log('=== ARROW CHECK ===');
            console.log('Found dropdown arrows:', arrows.length);
            console.log('Collections toggle exists:', !!toggle);
            if(toggle) {
                console.log('Collections HTML:', toggle.innerHTML);
            }
        }, 100);

        // Don't set test values - let server provide real data
        console.log('Waiting for real server data...');

        // Wait for auth check to complete before fetching real counts
        setTimeout(() => {
            if(typeof updateCartAndWishlistCounts === 'function') {
                updateCartAndWishlistCounts();
            }
        }, 1000);
    }, 100);
});
