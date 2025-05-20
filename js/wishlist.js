document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }

    // Load wishlist items
    loadWishlist();
    loadWishlistCount(); // Call the function to load the count

    // Back button functionality
    document.querySelector('.back-link').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'dashboard.html';
    });

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-btn') || event.target.closest('.remove-btn')) {
            console.log('Remove button clicked!');
            const removeButton = event.target.classList.contains('remove-btn') ? event.target : event.target.closest('.remove-btn');
            const wishlistItem = removeButton.closest('.wishlist-item');
            if (wishlistItem) {
                const productId = wishlistItem.dataset.productId;
                console.log('Product ID found:', productId);
                removeFromWishlist(productId);
            }
        }
    });
});

async function loadWishlist() {
    try {
        const response = await fetch('/rosiee/php/get_wishlist.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            renderWishlist(data.wishlist);
        } else {
            showNotification('Error loading wishlist: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading wishlist:', error);
        showNotification('Error loading wishlist', 'error');
    }
}

async function loadWishlistCount() {
    try {
        const response = await fetch('/rosiee/php/get_wishlist.php');
        const data = await response.json();
        if (data.success) {
            const wishlistCountElement = document.querySelector('.wishlist-count');
            if (wishlistCountElement) {
                wishlistCountElement.textContent = data.total_items || 0;
            } else {
                console.warn('Wishlist count element with class "wishlist-count" not found.');
            }
        } else {
            console.error('Error loading wishlist count:', data.message);
        }
    } catch (error) {
        console.error('Error loading wishlist count:', error);
    }
}

function renderWishlist(wishlist) {
    const wishlistGrid = document.querySelector('.wishlist-grid');
    const emptyWishlist = document.querySelector('.empty-wishlist');

    if (wishlist.length === 0) {
        wishlistGrid.style.display = 'none';
        emptyWishlist.style.display = 'flex';
        return;
    }

    wishlistGrid.style.display = 'grid';
    emptyWishlist.style.display = 'none';

    wishlistGrid.innerHTML = wishlist.map(product => `
        <div class="wishlist-item" data-product-id="${product.product_id}">
            <div class="item-image">
                <img src="${product.image_url}" alt="${product.name}">
            </div>
            <div class="item-details">
                <h3>${product.name}</h3>
                <p class="price">₹${parseFloat(product.price).toFixed(2)}</p>
                <div class="item-actions">
                    <button class="add-to-cart-btn" onclick="addToCartFromWishlist('${product.product_id}')">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="remove-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function addToCartFromWishlist(productId) {
    try {
        const response = await fetch('/rosiee/php/add_to_cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `product_id=${productId}&quantity=1`
        });

        const result = await response.json();
        if (result.success) {
            showNotification(result.message, 'success');
            console.log('Attempting to remove from wishlist (add to cart):', productId);
            removeWishlistItemFromDOM(productId);
            updateWishlistCount(-1); // Update the count after adding to cart
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to add to cart.', 'error');
    }
}

async function removeFromWishlist(productId) {
    console.log('Attempting to remove product ID:', productId);
    try {
        const response = await fetch('/rosiee/php/remove_from_wishlist.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product_id: productId })
        });

        const data = await response.json();

        if (data.success) {
            removeWishlistItemFromDOM(productId);
            showNotification('Item removed from wishlist', 'success');
            updateWishlistCount(-1); // Update the count after removing
        } else {
            showNotification('Error removing item: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        showNotification('Error removing from wishlist', 'error');
    }
}

function removeWishlistItemFromDOM(productId) {
    const wishlistItem = document.querySelector(`.wishlist-item[data-product-id="${productId}"]`);
    if (wishlistItem) {
        wishlistItem.remove();
        const wishlistGrid = document.querySelector('.wishlist-grid');
        if (wishlistGrid.children.length === 0) {
            wishlistGrid.style.display = 'none';
            document.querySelector('.empty-wishlist').style.display = 'flex';
        }
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: type === 'success' ? '#4CAF50' : '#f44336',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: '1000',
        animation: 'slideIn 0.3s ease-out'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function updateWishlistCount(change) {
    const wishlistCountElement = document.querySelector('.wishlist-count');
    if (wishlistCountElement) {
        const currentCount = parseInt(wishlistCountElement.textContent) || 0;
        wishlistCountElement.textContent = currentCount + change;
    }
}

