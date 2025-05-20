document.addEventListener('DOMContentLoaded', () => {
    // Load cart data and update summary
    loadCartSummary();

    // Format card number input
    const cardNumberInput = document.getElementById('card-number');
    cardNumberInput.addEventListener('input', formatCardNumber);

    // Format expiry date input
    const expiryInput = document.getElementById('expiry');
    expiryInput.addEventListener('input', formatExpiry);

    // Restrict CVV to numbers only
    const cvvInput = document.getElementById('cvv');
    cvvInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
    
    // Restrict phone number to 10 numbers only
    const phoneInput = document.getElementById('billing-phone');
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });

    // Handle form submission
    const paymentForm = document.getElementById('payment-form');
    paymentForm.addEventListener('submit', handlePayment);

    // Auto-fill billing info if available
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (userData) {
        document.getElementById('billing-name').value = userData.full_name || '';
        document.getElementById('billing-email').value = userData.email || '';
    }

    // Format currency function
    function formatCurrency(amount) {
        return '₹' + parseFloat(amount).toFixed(2);
    }

    // Update totals if needed
    function updateTotals() {
        const subtotalElement = document.querySelector('.subtotal-amount');
        const shippingElement = document.querySelector('.shipping-info span:last-child');
        const totalElement = document.querySelector('.total-amount');

        if (subtotalElement && shippingElement && totalElement) {
            const subtotal = parseFloat(subtotalElement.textContent.replace('₹', ''));
            const shipping = parseFloat(shippingElement.textContent.replace('₹', ''));
            const total = subtotal + shipping;

            totalElement.textContent = formatCurrency(total);
        }
    }

    // Initialize any dynamic elements
    updateTotals();
});

function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = value;
}

function formatExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }
    e.target.value = value;
}

async function loadCartSummary() {
    try {
        // Get cart data from session storage instead of making an API call
        const cartData = JSON.parse(sessionStorage.getItem('cart')) || [];
        const orderItems = document.getElementById('order-items');
        
        if (!cartData || cartData.length === 0) {
            // If no cart data, redirect to cart page
            window.location.href = 'cart.html';
            return;
        }

        // Calculate totals
        let subtotal = 0;
        let html = '';

        cartData.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            html += `
                <div class="order-item">
                    <span class="item-name">${item.name} x${item.quantity}</span>
                    <span class="item-price">₹${itemTotal.toFixed(2)}</span>
                </div>
            `;
        });

        // Update the DOM
        orderItems.innerHTML = html;
        
        // Set shipping cost
        const shipping = subtotal > 0 ? 5.00 : 0;
        const total = subtotal + shipping;

        // Update all the amounts
        document.querySelector('.subtotal-amount').textContent = `₹${subtotal.toFixed(2)}`;
        document.querySelector('.shipping-info span:last-child').textContent = `₹${shipping.toFixed(2)}`;
        document.querySelector('.total-amount').textContent = `₹${total.toFixed(2)}`;
        document.getElementById('pay-amount').textContent = total.toFixed(2);

    } catch (error) {
        console.error('Error loading cart:', error);
        // Redirect to cart page if there's an error
        window.location.href = 'cart.html';
    }
}

async function handlePayment(e) {
    e.preventDefault();

    // Validate card details
    const cardNumber = document.getElementById('card-number').value;
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;
    
    if (!cardNumber || !expiry || !cvv) {
        showNotification('Please fill in all card details', 'error');
        return;
    }
    
    // Process payment
    try {
        const response = await fetch('/rosiee/php/process_payment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cardNumber,
                expiry,
                cvv,
                amount: document.querySelector('.total-amount').textContent,
                items: Array.from(document.querySelectorAll('.order-item')).map(item => ({
                    name: item.querySelector('.item-name').textContent,
                    price: item.querySelector('.item-price').textContent
                }))
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showPaymentSuccess();
        } else {
            showNotification(data.message || 'Payment failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Payment error:', error);
        showNotification('An error occurred during payment. Please try again.', 'error');
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

function showPaymentSuccess() {
    // Show success overlay
    const overlay = document.querySelector('.payment-success-overlay');
    overlay.style.display = 'flex';

    // Hide order number and amount paid (already removed from HTML)
    // Set up DONE button
    const doneBtn = document.getElementById('done-btn');
    if (doneBtn) {
        doneBtn.onclick = () => {
            window.location.href = 'dashboard.html';
        };
    }

    // Also allow clicking outside the modal to go to dashboard
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            window.location.href = 'dashboard.html';
        }
    });
} 