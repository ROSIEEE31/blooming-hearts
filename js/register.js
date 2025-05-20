document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');
    const messageContainer = document.getElementById('register-message');

    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get and trim input values
        const full_name = document.getElementById('register-full-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const confirmPassword = document.getElementById('register-confirm-password').value.trim();

        // Email validation - stricter regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid Gmail address (e.g. yourname@gmail.com)', 'error');
            return;
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
        if (!passwordRegex.test(password)) {
            showMessage('Password must be at least 8 characters and include one uppercase letter, one lowercase letter, and one special character (!@#$%^&*)', 'error');
            return;
        }

        // Confirm password
        if (password !== confirmPassword) {
            showMessage('Passwords do not match!', 'error');
            return;
        }

        try {
            const response = await fetch('/rosiee/php/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `full_name=${encodeURIComponent(full_name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&confirm_password=${encodeURIComponent(confirmPassword)}`
            });

            const data = await response.json();

            if (data.success) {
                showMessage('Registration successful! Redirecting to login...', 'success');
                this.reset();
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showMessage(data.message || 'Registration failed. Please try again.', 'error');
            }
        } catch (error) {
            showMessage('An error occurred. Please try again.', 'error');
            console.error('Error:', error);
        }
    });

    function showMessage(message, type) {
        messageContainer.textContent = message;
        messageContainer.className = 'message-container ' + type;
        messageContainer.style.display = 'block';
    }
});