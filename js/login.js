document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const messageContainer = document.getElementById('login-message');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {
            showMessage('Logging in...', 'info');

            const response = await fetch('../php/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server did not return JSON!');
            }

            const text = await response.text(); // Get the raw text first
            if (!text) {
                throw new Error('Empty response from server');
            }

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse JSON:', text);
                throw new Error('Invalid JSON response from server');
            }

            if (data.success) {
                // Store user data in session storage
                sessionStorage.setItem('userData', JSON.stringify({
                    full_name: data.full_name,
                    email: data.email,
                    role: data.role
                }));

                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1500);
            } else {
                showMessage(data.message || 'Login failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage(error.message || 'Network error. Please try again later.', 'error');
        }
    });

    function showMessage(msg, type) {
        messageContainer.textContent = msg;
        messageContainer.className = `message-container ${type}`;
        messageContainer.style.display = 'block';
    }
});
