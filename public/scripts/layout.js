var isAuthenticated = false;

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

function initializeBaseLayout(){
    initializeTheme();
    checkAuthStatus();

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
