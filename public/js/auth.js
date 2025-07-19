// auth.js - JavaScript for Login and Signup pages (MyFuel Theme)

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    // Ensure messageBox is correctly scoped or retrieved for each form
    const loginMessageBox = loginForm ? loginForm.closest('.auth-container').querySelector('#messageBox') : null;
    const signupMessageBox = signupForm ? signupForm.closest('.auth-container').querySelector('#messageBox') : null;

    // Add event listeners for input focus/blur to handle label animation
    document.querySelectorAll('.input-box input').forEach(input => {
        // Trigger label lift if input has a value on page load (e.g., browser autofill)
        if (input.value) {
            input.classList.add('valid'); // Add a class to keep label up
        }
        input.addEventListener('focus', () => {
            input.classList.add('valid');
        });
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.classList.remove('valid');
            }
        });
    });


    // Function to display messages in the message box
    function showMessage(message, type = 'error', targetMessageBox) {
        if (targetMessageBox) {
            targetMessageBox.textContent = message;
            targetMessageBox.className = `mt-4 p-3 rounded-md text-center ${type} block`;
            setTimeout(() => {
                targetMessageBox.classList.add('hidden');
            }, 5000);
        } else {
            console.error("Message box element not found.");
        }
    }

    // --- Validation Functions ---
    function isValidEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function isValidIndianPhoneNumber(phoneNumber) {
        // Indian phone numbers typically 10 digits, starting with 6, 7, 8, or 9
        const re = /^[6-9]\d{9}$/;
        return re.test(String(phoneNumber));
    }

    function isStrongPassword(password) {
        // Password must be at least 8 characters long, contain at least one uppercase letter,
        // one lowercase letter, one number, and one special character.
        if (password.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters long.' };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one uppercase letter.' };
        }
        if (!/[a-z]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one lowercase letter.' };
        }
        if (!/\d/.test(password)) {
            return { valid: false, message: 'Password must contain at least one number.' };
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one special character.' };
        }
        return { valid: true, message: '' };
    }


    // --- Handle Login Form Submission ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = loginForm.email.value;
            const password = loginForm.password.value;

            if (!email || !password) {
                showMessage('Please enter both email and password.', 'error', loginMessageBox);
                return;
            }
            if (!isValidEmail(email)) {
                showMessage('Please enter a valid email address.', 'error', loginMessageBox);
                return;
            }

            showMessage('Logging in...', 'info', loginMessageBox);

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
                    showMessage(data.message || 'Login successful! Redirecting...', 'success', loginMessageBox);
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    setTimeout(() => {
                        window.location.href = '/dashboard'; // Redirect to React dashboard
                    }, 1000);
                } else {
                    showMessage(data.message || 'Login failed. Please check your credentials.', 'error', loginMessageBox);
                }

            } catch (error) {
                console.error('Login error:', error);
                showMessage('An unexpected error occurred. Please try again later.', 'error', loginMessageBox);
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
            const phoneNumber = signupForm.phoneNumber ? signupForm.phoneNumber.value : '';

            if (!username || !email || !password || !confirmPassword) {
                showMessage('Please fill in all required fields.', 'error', signupMessageBox);
                return;
            }
            if (!isValidEmail(email)) {
                showMessage('Please enter a valid email address.', 'error', signupMessageBox);
                return;
            }
            const passwordStrength = isStrongPassword(password);
            if (!passwordStrength.valid) {
                showMessage(passwordStrength.message, 'error', signupMessageBox);
                return;
            }
            if (password !== confirmPassword) {
                showMessage('Passwords do not match.', 'error', signupMessageBox);
                return;
            }
            if (phoneNumber && !isValidIndianPhoneNumber(phoneNumber)) {
                showMessage('Please enter a valid 10-digit Indian phone number (starts with 6-9).', 'error', signupMessageBox);
                return;
            }

            showMessage('Registering...', 'info', signupMessageBox);

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
                    showMessage(data.message || 'Registration successful! Please login.', 'success', signupMessageBox);
                    setTimeout(() => {
                        window.location.href = '/login'; // Redirect to login page after successful signup
                    }, 1000);
                } else {
                    showMessage(data.message || 'Registration failed. Please try again.', 'error', signupMessageBox);
                }

            } catch (error) {
                console.error('Signup error:', error);
                showMessage('An unexpected error occurred during registration. Please try again later.', 'error', signupMessageBox);
            }
        });
    }
});
