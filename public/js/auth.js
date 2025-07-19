// auth.js - JavaScript for Login and Signup pages (MyFuel Theme)

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const messageBox = document.getElementById('messageBox');

    // Function to display messages in the message box
    function showMessage(message, type = 'error') {
        messageBox.textContent = message;
        messageBox.className = `mt-4 p-3 rounded-md text-center ${type} block`;
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 5000);
    }

    // --- Handle Login Form Submission ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = loginForm.email.value;
            const password = loginForm.password.value;

            if (!email || !password) {
                showMessage('Please enter both email and password.', 'error');
                return;
            }

            showMessage('Logging in...', 'info');

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(data.message || 'Login successful!', 'success');
                    // Store the JWT token in localStorage
                    localStorage.setItem('token', data.token);
                    // Store user info (optional, but useful for frontend)
                    localStorage.setItem('user', JSON.stringify(data.user));

                    setTimeout(() => {
                        window.location.href = 'dashboard.html'; // Redirect to React dashboard
                    }, 1000);
                } else {
                    showMessage(data.message || 'Login failed. Please check your credentials.', 'error');
                }

            } catch (error) {
                console.error('Login error:', error);
                showMessage('An unexpected error occurred. Please try again later.', 'error');
            }
        });
    }

    // --- Handle Signup Form Submission ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = signupForm.username.value;
            const email = signupForm.email.value;
            const password = signupForm.password.value;
            const confirmPassword = signupForm.confirm_password.value;
            const phoneNumber = signupForm.phoneNumber ? signupForm.phoneNumber.value : ''; // Optional phone number

            if (!username || !email || !password || !confirmPassword) {
                showMessage('Please fill in all required fields.', 'error');
                return;
            }
            if (password !== confirmPassword) {
                showMessage('Passwords do not match.', 'error');
                return;
            }
            if (password.length < 6) {
                showMessage('Password must be at least 6 characters long.', 'error');
                return;
            }

            showMessage('Registering...', 'info');

            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password, phoneNumber }),
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(data.message || 'Registration successful! Please login.', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html'; // Redirect to login page after successful signup
                    }, 1000);
                } else {
                    showMessage(data.message || 'Registration failed. Please try again.', 'error');
                }

            } catch (error) {
                console.error('Signup error:', error);
                showMessage('An unexpected error occurred during registration. Please try again later.', 'error');
            }
        });
    }
});
