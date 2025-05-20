document.addEventListener('DOMContentLoaded', () => {
    // Get admin name from session storage
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (userData) {
        document.getElementById('admin-name').textContent = userData.full_name;
    }

    // Navigation handling
    const usersLink = document.getElementById('users-link');
    const ordersLink = document.getElementById('orders-link');
    const feedbackLink = document.getElementById('feedback-link');
    const logoutLink = document.getElementById('logout-link');

    const usersSection = document.getElementById('users-section');
    const ordersSection = document.getElementById('orders-section');
    const feedbackSection = document.getElementById('feedback-section');
    const feedbackTableBody = document.getElementById('feedback-table-body'); // Selector for feedback table body

    // Show users section by default
    usersSection.classList.add('active');
    ordersSection.classList.remove('active');
    feedbackSection.classList.remove('active');
    usersLink.classList.add('active');

    usersLink.addEventListener('click', (e) => {
        e.preventDefault();
        usersSection.classList.add('active');
        ordersSection.classList.remove('active');
        feedbackSection.classList.remove('active');
        usersLink.classList.add('active');
        ordersLink.classList.remove('active');
        feedbackLink.classList.remove('active');
        loadUsers(); // Load users when the link is clicked
    });

    ordersLink.addEventListener('click', (e) => {
        e.preventDefault();
        ordersSection.classList.add('active');
        usersSection.classList.remove('active');
        feedbackSection.classList.remove('active');
        ordersLink.classList.add('active');
        usersLink.classList.remove('active');
        feedbackLink.classList.remove('active');
        loadOrders(); // Load orders when the link is clicked
    });

    feedbackLink.addEventListener('click', (e) => {
        e.preventDefault();
        feedbackSection.classList.add('active');
        usersSection.classList.remove('active');
        ordersSection.classList.remove('active');
        feedbackLink.classList.add('active');
        usersLink.classList.remove('active');
        ordersLink.classList.remove('active');
        loadFeedback(); // Load feedback when the link is clicked
    });

    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = '../html/index.html';
    });

    const addUserBtn = document.querySelector('#users-section .add-btn'); // Select the add button within the users section
    const addUserModal = document.getElementById('addUserModal');
    const closeButton = addUserModal.querySelector('.close-button');
    const addUserForm = document.getElementById('addUserForm');
    const usersTableBody = document.getElementById('users-table-body'); // Select by ID
    const ordersTableBody = document.getElementById('orders-table-body'); // Add selector for orders table body

    // Function to load and render users
    async function loadUsers() {
        try {
            const response = await fetch('../php/admin_get_users.php'); // Changed to admin_get_users.php
            if (!response.ok) {
                const text = await response.text();
                console.error('HTTP error!', response.status, text);
                showNotification('Failed to load users', 'error');
                return;
            }
            const data = await response.json();

            if (data.success) {
                renderUsers(data.users);
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            showNotification('Failed to load users', 'error');
        }
    }

    function renderUsers(users) {
        console.log('Users data received:', users);
        usersTableBody.innerHTML = ''; // Clear existing rows
        users.forEach(user => {
            const row = usersTableBody.insertRow();
            const idCell = row.insertCell();
            const nameCell = row.insertCell();
            const emailCell = row.insertCell();
            const actionsCell = row.insertCell();

            idCell.textContent = user.id;
            nameCell.textContent = user.full_name;
            emailCell.textContent = user.email;
            actionsCell.innerHTML = `<button class="action-btn delete" data-user-id="${user.id}"><i class="fas fa-trash-alt"></i> Delete</button>`; // Template literal for clarity
        });
    }

    // Function to load and render orders
    async function loadOrders() {
        try {
            const response = await fetch('../php/admin_get_orders.php'); // Fetch orders data
            if (!response.ok) {
                const text = await response.text();
                console.error('HTTP error!', response.status, text);
                showNotification('Failed to load orders', 'error');
                return;
            }
            const data = await response.json();

            if (data.success) {
                renderOrders(data.orders);
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            showNotification('Failed to load orders', 'error');
        }
    }

    function renderOrders(orders) {
        console.log('Orders data received:', orders);
        ordersTableBody.innerHTML = ''; // Clear existing rows
        orders.forEach(order => {
            const row = ordersTableBody.insertRow();
            row.insertCell().textContent = order.order_id;
            row.insertCell().textContent = order.user_id;
            row.insertCell().textContent = order.order_date;
            row.insertCell().textContent = order.total_amount;
            row.insertCell().textContent = order.order_status;
            // Add more cells for other order details as needed
            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `<button class="action-btn delete-order" data-order-id="${order.order_id}"><i class="fas fa-trash-alt"></i> Delete</button>`; // Added delete button
        });
    }

    // Function to load and render feedback
    async function loadFeedback() {
        try {
            const response = await fetch('../php/admin_get_feedback.php'); // Fetch feedback data
            if (!response.ok) {
                const text = await response.text();
                console.error('HTTP error!', response.status, text);
                showNotification('Failed to load feedback', 'error');
                return;
            }
            const data = await response.json();

            if (data.success) {
                renderFeedback(data.feedback);
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error loading feedback:', error);
            showNotification('Failed to load feedback', 'error');
        }
    }

    function renderFeedback(feedbackItems) {
        console.log('Feedback data received:', feedbackItems);
        feedbackTableBody.innerHTML = ''; // Clear existing rows
        feedbackItems.forEach(feedback => {
            const row = feedbackTableBody.insertRow();
            row.insertCell().textContent = feedback.id;
            row.insertCell().textContent = feedback.full_name;
            row.insertCell().textContent = feedback.email;
            row.insertCell().textContent = feedback.subject;
            row.insertCell().textContent = feedback.message;
            row.insertCell().textContent = feedback.submission_date;
            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `<button class="action-btn delete-feedback" data-feedback-id="${feedback.id}"><i class="fas fa-trash-alt"></i> Delete</button>`; // Example actions with delete button
        });
    }

    // Show Add User Modal
    addUserBtn.addEventListener('click', () => {
        addUserModal.style.display = 'block';
    });

    // Close Add User Modal
    closeButton.addEventListener('click', () => {
        addUserModal.style.display = 'none';
        addUserForm.reset(); // Clear the form
    });

    // Close Modal if clicked outside
    window.addEventListener('click', (event) => {
        if (event.target === addUserModal) {
            addUserModal.style.display = 'none';
            addUserForm.reset();
        }
    });

    // Handle Add User Form Submission
    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addUserForm);

        try {
            const response = await fetch('../php/admin_add_user.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                showNotification(data.message, 'success');
                addUserModal.style.display = 'none';
                addUserForm.reset();
                loadUsers(); // Reload the user list
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            showNotification('Failed to add user.', 'error');
        }
    });

    // Handle Delete User
    document.querySelector('#users-section .table-container tbody').addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete');
        if (deleteBtn) {
            const userId = deleteBtn.dataset.userId;
            if (confirm(`Are you sure you want to delete user ID ${userId}?`)) {
                try {
                    const formData = new FormData();
                    formData.append('user_id', userId);

                    const response = await fetch('../php/admin_delete_user.php', { // Changed to admin_delete_user.php
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();

                    if (data.success) {
                        showNotification(data.message, 'success');
                        loadUsers(); // Reload the user list
                    } else {
                        showNotification(data.message, 'error');
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    showNotification('Failed to delete user.', 'error');
                }
            }
        }
    });

    // Handle Delete Order
    document.querySelector('#orders-section .table-container tbody').addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-order'); // Target the delete button for orders
        if (deleteBtn) {
            const orderId = deleteBtn.dataset.orderId;
            if (confirm(`Are you sure you want to delete order ID ${orderId}?`)) {
                try {
                    const formData = new FormData();
                    formData.append('order_id', orderId);

                    const response = await fetch('../php/admin_delete_order.php', { // Path to your delete order PHP script
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();

                    if (data.success) {
                        showNotification(data.message, 'success');
                        loadOrders(); // Reload the order list
                    } else {
                        showNotification(data.message, 'error');
                    }
                } catch (error) {
                    console.error('Error deleting order:', error);
                    showNotification('Failed to delete order.', 'error');
                }
            }
        }
    });

    // Handle Delete Feedback
    document.querySelector('#feedback-section .table-container tbody').addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-feedback'); // Target the delete button for feedback
        if (deleteBtn) {
            const feedbackId = deleteBtn.dataset.feedbackId;
            if (confirm(`Are you sure you want to delete feedback ID ${feedbackId}?`)) {
                try {
                    const formData = new FormData();
                    formData.append('feedback_id', feedbackId);

                    const response = await fetch('../php/admin_delete_feedback.php', { // Path to your delete feedback PHP script
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();

                    if (data.success) {
                        showNotification(data.message, 'success');
                        loadFeedback(); // Reload the feedback list
                    } else {
                        showNotification(data.message, 'error');
                    }
                } catch (error) {
                    console.error('Error deleting feedback:', error);
                    showNotification('Failed to delete feedback.', 'error');
                }
            }
        }
    });

    // Notification function
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

    // Load users on initial load if on the users section
    if (window.location.hash === '#users' || window.location.hash === '') {
        loadUsers();
    }
});