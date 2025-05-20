document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    const cartCount = document.querySelector('.cart-count');
    const wishlistCount = document.querySelector('.wishlist-count'); // Assuming you have a wishlist count element

    // 🔍 Search functionality
    searchInput?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        productCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.product-description')?.textContent.toLowerCase() || '';
            card.style.display = (title.includes(searchTerm) || description.includes(searchTerm)) ? 'block' : 'none';
        });
    });

    // 🎯 Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.getAttribute('data-category');
            productCards.forEach(card => {
                card.style.display = (category === 'all' || card.dataset.category === category) ? 'block' : 'none';
            });
        });
    });

    // 🛒 Add to cart functionality
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const card = button.closest('.product-card');
            const productId = card.getAttribute('data-product-id');
            const quantity = 1;

            try {
                const response = await fetch('../php/add_to_cart.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `product_id=${productId}&quantity=${quantity}`
                });

                const result = await response.json();
                if (result.success) {
                    showNotification(result.message, 'success'); // Notification on success
                    updateCartCount(quantity);
                } else {
                    showNotification(result.message, 'error'); // Notification on error
                }
            } catch (err) {
                console.error('Error:', err);
                showNotification('Failed to add to cart.', 'error'); // Notification on fetch error
            }
        });
    });

    // 👀 Quick view modal
    document.querySelectorAll('.quick-view-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = button.closest('.product-card');
            const productTitle = card.querySelector('h3')?.textContent || '';
            const productDescription = card.querySelector('.product-description')?.textContent || '';
            const productPrice = card.querySelector('.product-price')?.textContent || '';
            const productImage = card.querySelector('img')?.src || '';

            const modal = document.createElement('div');
            modal.className = 'quick-view-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <button class="close-modal">&times;</button>
                    <div class="modal-image"><img src="${productImage}" alt="${productTitle}"></div>
                    <div class="modal-info">
                        <h2>${productTitle}</h2>
                        <p>${productDescription}</p>
                        <div class="modal-price">${productPrice}</div>
                        <button class="modal-add-to-cart" data-product-id="${card.dataset.productId}">Add to Cart</button>
                    </div>
                </div>
            `;
            styleModal(modal);
            document.body.appendChild(modal);

            // Close modal
            modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });

            // Add to cart from modal
            modal.querySelector('.modal-add-to-cart').addEventListener('click', async function() {
                const modalProductId = this.dataset.productId;
                try {
                    const response = await fetch('../php/add_to_cart.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `product_id=${modalProductId}&quantity=1`
                    });

                    const result = await response.json();
                    if (result.success) {
                        showNotification(result.message, 'success'); // Notification on success from modal
                        updateCartCount(1);
                    } else {
                        showNotification(result.message, 'error'); // Notification on error from modal
                    }
                    modal.remove();
                } catch (err) {
                    console.error('Error:', err);
                    showNotification('Failed to add to cart.', 'error'); // Notification on fetch error from modal
                }
            });
        });
    });

    // Add/Remove wishlist functionality
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = this.closest('.product-card').dataset.productId;
            if (this.classList.contains('wishlisted')) {
                removeFromWishlist(productId, this);
            } else {
                addToWishlist(productId, this);
            }
        });
    });

    // 🔔 Notification function
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
            borderRadius: '8px',
            zIndex: '1000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideIn 0.3s ease-out'
        });

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // 🔁 Update cart count
    function updateCartCount(amount) {
        if (cartCount) {
            const current = parseInt(cartCount.textContent) || 0;
            cartCount.textContent = current + amount;
        }
    }

    // 🎨 Modal styling
    function styleModal(modal) {
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000'
        });

        const content = modal.querySelector('.modal-content');
        Object.assign(content.style, {
            background: '#fff',
            padding: '2rem',
            borderRadius: '15px',
            maxWidth: '800px',
            width: '90%',
            display: 'flex',
            gap: '2rem',
            position: 'relative'
        });

        const closeBtn = modal.querySelector('.close-modal');
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            fontSize: '2rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
        });
    }

    // 🌀 Keyframes for notification
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(styleSheet);

    // Function to add to wishlist
    async function addToWishlist(productId, button) {
        try {
            const response = await fetch('/rosiee/php/add_to_wishlist.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `product_id=${productId}`
            });

            const data = await response.json();
            if (data.success) {
                showNotification(data.message, 'success'); // Notification on success
                button.classList.add('wishlisted');
                if (wishlistCount) {
                    wishlistCount.textContent = parseInt(wishlistCount.textContent) + 1;
                }
            } else {
                showNotification(data.message, 'error'); // Notification on error
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            showNotification('Failed to add to wishlist', 'error'); // Notification on fetch error
        }
    }

    // Function to remove from wishlist
    async function removeFromWishlist(productId, button) {
        try {
            const response = await fetch('/rosiee/php/remove_from_wishlist.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `product_id=${productId}`
            });

            const data = await response.json();
            if (data.success) {
                showNotification(data.message, 'success'); // Notification on success
                button.classList.remove('wishlisted');
                if (wishlistCount && parseInt(wishlistCount.textContent) > 0) {
                    wishlistCount.textContent = parseInt(wishlistCount.textContent) - 1;
                }
            } else {
                showNotification(data.message, 'error'); // Notification on error
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            showNotification('Failed to remove from wishlist', 'error'); // Notification on fetch error
        }
    }
});