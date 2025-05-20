document.addEventListener('DOMContentLoaded', () => {
    // Get user data from session storage
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (userData) {
        document.getElementById('user-name').textContent = userData.full_name;
    }

    // Navigation links
    const cartLink = document.getElementById('cart-link');
    const catalogLink = document.getElementById('catalog-link');
    const wishlistLink = document.getElementById('wishlist-link');
    const contactLink = document.getElementById('contact-link');
    const logoutLink = document.getElementById('logout-link');

    // Add click event listeners
    cartLink.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });

    catalogLink.addEventListener('click', () => {
        window.location.href = 'catalog.html';
    });

    wishlistLink.addEventListener('click', () => {
        window.location.href = 'wishlist.html';
    });

    contactLink.addEventListener('click', () => {
        window.location.href = 'contact.html';
    });

    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = '../html/index.html';
    });

    // Add hover effects to navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-5px)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0)';
        });
    });

    // Load cart and wishlist counts
    loadCartCount();
    loadWishlistCount(); // Keep this to load the count
});

async function loadCartCount() {
    try {
        const response = await fetch('/rosiee/php/get_cart.php');
        const data = await response.json();
        if (data.success) {
            const cartCount = data.items.reduce((total, item) => total + item.quantity, 0);
            document.querySelector('.cart-count').textContent = cartCount;
        }
    } catch (error) {
        console.error('Error loading cart count:', error);
    }
}

async function loadWishlistCount() {
    try {
        const response = await fetch('/rosiee/php/get_wishlist.php');
        const data = await response.json();
        if (data.success && data.total_items !== undefined) {
            document.querySelector('.wishlist-count').textContent = data.total_items;
        } else if (data.success && data.total_items === undefined) {
            console.warn('total_items not found in the wishlist data.');
            document.querySelector('.wishlist-count').textContent = 0; // Set to 0 as a fallback
        }
    } catch (error) {
        console.error('Error loading wishlist count:', error);
    }
}