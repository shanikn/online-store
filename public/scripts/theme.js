// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mark that theme.js is initialized
    window.themeInitialized = true;

    // Get theme toggle button and icon
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');

    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem('theme');

    // Apply saved theme or default to light mode
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if(themeIcon) themeIcon.className = 'fas fa-sun';
        if(themeText) themeText.textContent = 'ON';
    } else {
        document.body.classList.remove('dark-mode');
        if(themeIcon) themeIcon.className = 'fas fa-moon';
        if(themeText) themeText.textContent = 'OFF';
    }

    // Create toggle handler function and expose it globally
    window.themeToggleHandler = function() {
        if (document.body.classList.contains('dark-mode')) {
            // Switch to light mode
            document.body.classList.remove('dark-mode');
            if(themeIcon) themeIcon.className = 'fas fa-moon';
            if(themeText) themeText.textContent = 'OFF';
            localStorage.setItem('theme', 'light');
        } else {
            // Switch to dark mode
            document.body.classList.add('dark-mode');
            if(themeIcon) themeIcon.className = 'fas fa-sun';
            if(themeText) themeText.textContent = 'ON';
            localStorage.setItem('theme', 'dark');
        }
    };

    // If theme toggle button exists, set click handler
    if (themeToggle) {
        themeToggle.addEventListener('click', window.themeToggleHandler);
    }
});