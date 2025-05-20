document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById('checkout-btn');
    loadCart();

    checkoutBtn.addEventListener('click', () => {
        window.location.href = 'payment.html';
    });
});

async function loadCart() {
    try {
        const response = await fetch('/rosiee/php/get_cart.php');
        const data = await response.json();

        const cartItemsContainer = document.getElementById('cart-items');
        const cartSummary = document.getElementById('cart-summary');
        const emptyCart = document.getElementById('empty-cart');

        if (data.success) {
            if (data.items && data.items.length > 0) {
                renderCartItems(data.items);
                updateCartSummary(data.items);
                cartItemsContainer.style.display = 'block';
                cartSummary.style.display = 'block';
                emptyCart.style.display = 'none';
            } else {
                cartItemsContainer.style.display = 'none';
                cartSummary.style.display = 'none';
                emptyCart.style.display = 'block';
            }
        } else {
            showNotification('Error loading cart: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        showNotification('Error loading cart', 'error');
    }
}

function renderCartItems(items) {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = items.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <input type="number" value="${item.quantity}" min="1" onchange="changeQuantity(${item.id}, this)">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <p class="price">₹${(item.price * item.quantity).toFixed(2)}</p>
            <button class="remove-btn" onclick="removeItem(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function updateCartSummary(items) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = items.length > 0 ? 5.00 : 0;
    const total = subtotal + shipping;

    document.getElementById('cart-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('cart-shipping').textContent = `₹${shipping.toFixed(2)}`;
    document.getElementById('cart-grand-total').textContent = `₹${total.toFixed(2)}`;
}

async function updateQuantity(productId, change) {
    try {
        const response = await fetch('/rosiee/php/update_cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: productId,
                quantity_change: change
            })
        });

        const data = await response.json();
        if (data.success) {
            loadCart();
            showNotification('Quantity updated', 'success');
        } else {
            showNotification('Error updating quantity: ' + data.message, 'error');
        }
    } catch (error) {
        showNotification('Error updating quantity', 'error');
    }
}

async function changeQuantity(productId, inputElem) {
    const newQty = parseInt(inputElem.value);
    if (isNaN(newQty) || newQty < 1) {
        showNotification('Invalid quantity', 'error');
        inputElem.value = 1;
        return;
    }

    try {
        const response = await fetch('/rosiee/php/update_cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: productId,
                new_quantity: newQty
            })
        });

        const data = await response.json();
        if (data.success) {
            loadCart();
            showNotification('Quantity updated', 'success');
        } else {
            showNotification('Error updating quantity: ' + data.message, 'error');
        }
    } catch (error) {
        showNotification('Error updating quantity', 'error');
    }
}

async function removeItem(productId) {
    if (!confirm('Are you sure you want to remove this item?')) return;

    try {
        const response = await fetch('/rosiee/php/remove_from_cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId })
        });

        const data = await response.json();
        if (data.success) {
            loadCart();
            showNotification('Item removed from cart', 'success');
        } else {
            showNotification('Error removing item: ' + data.message, 'error');
        }
    } catch (error) {
        showNotification('Error removing item', 'error');
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
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 1000
    });

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Ensure functions are globally available for HTML inline events
window.updateQuantity = updateQuantity;
window.changeQuantity = changeQuantity;
window.removeItem = removeItem;
document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById('checkout-btn');
    loadCart(); // Keep your existing loadCart function

    checkoutBtn.addEventListener('click', proceedToPayment); // Add this event listener
});

async function proceedToPayment() {
    try {
        const response = await fetch('/rosiee/php/get_cart.php'); // Fetch cart data to ensure it's up-to-date
        const data = await response.json();

        if (data.success && data.items && data.items.length > 0) {
            sessionStorage.setItem('cart', JSON.stringify(data.items.map(item => ({
                product_id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            }))));
            sessionStorage.setItem('cartTotal', document.getElementById('cart-grand-total').textContent);
            window.location.href = 'payment.html';
        } else {
            alert('Your cart is empty or there was an error loading it.');
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        alert('Failed to proceed to checkout.');
    }
}