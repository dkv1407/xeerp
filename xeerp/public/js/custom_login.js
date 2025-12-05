/**
 * Custom Login Page JavaScript
 * Handles authentication, form validation, and UI interactions
 */

(function() {
	'use strict';

	// Wait for DOM to be ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initLoginPage);
	} else {
		initLoginPage();
	}

	function initLoginPage() {
		// Only initialize on login page
		const loginForm = document.getElementById('custom-login-form');
		if (!loginForm) return;

		// Initialize password toggle
		initPasswordToggle();

		// Initialize form submission
		initFormSubmission(loginForm);

		// Initialize form validation
		initFormValidation(loginForm);

		// Check for redirect messages
		checkUrlParams();
	}

	/**
	 * Initialize password visibility toggle
	 */
	function initPasswordToggle() {
		const toggleButton = document.getElementById('toggle-password');
		const passwordInput = document.getElementById('login_password');
		const eyeIcon = toggleButton.querySelector('.eye-icon');
		const eyeOffIcon = toggleButton.querySelector('.eye-off-icon');

		if (!toggleButton || !passwordInput) return;

		toggleButton.addEventListener('click', function() {
			const isPassword = passwordInput.type === 'password';

			// Toggle input type
			passwordInput.type = isPassword ? 'text' : 'password';

			// Toggle icon visibility
			eyeIcon.style.display = isPassword ? 'none' : 'block';
			eyeOffIcon.style.display = isPassword ? 'block' : 'none';

			// Update aria-label
			toggleButton.setAttribute(
				'aria-label',
				isPassword ? 'Hide password' : 'Show password'
			);

			// Keep focus on password input
			passwordInput.focus();
		});
	}

	/**
	 * Initialize form submission handler
	 */
	function initFormSubmission(form) {
		form.addEventListener('submit', async function(e) {
			e.preventDefault();

			// Get form values
			const email = document.getElementById('login_email').value.trim();
			const password = document.getElementById('login_password').value;
			const rememberMe = document.getElementById('remember_me').checked;

			// Validate
			if (!email || !password) {
				showMessage('Please enter both email/username and password', 'error');
				return;
			}

			// Show loading state
			setLoadingState(true);
			hideMessage();

			try {
				// Perform login using Frappe's authentication API
				const result = await performLogin(email, password, rememberMe);

				if (result.success) {
					// Show success message
					showMessage('Login successful! Redirecting...', 'success');

					// Redirect after short delay
					setTimeout(() => {
						const redirectTo = getRedirectUrl();
						window.location.href = redirectTo;
					}, 800);
				} else {
					// Show error message
					showMessage(result.message || 'Invalid credentials. Please try again.', 'error');
					setLoadingState(false);
				}
			} catch (error) {
				console.error('Login error:', error);
				showMessage('An error occurred during login. Please try again.', 'error');
				setLoadingState(false);
			}
		});
	}

	/**
	 * Perform login using Frappe API
	 */
	function performLogin(email, password, rememberMe) {
		return new Promise((resolve, reject) => {
			// Use Frappe's call method if available
			if (window.frappe && frappe.call) {
				frappe.call({
					method: 'login',
					args: {
						usr: email,
						pwd: password
					},
					callback: function(response) {
						if (response.message === 'Logged In') {
							resolve({ success: true });
						} else {
							resolve({
								success: false,
								message: response.message || 'Login failed'
							});
						}
					},
					error: function(error) {
						console.error('Login API error:', error);
						resolve({
							success: false,
							message: error.message || 'Login failed'
						});
					}
				});
			} else {
				// Fallback to direct fetch if frappe.call is not available
				fetch('/api/method/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Accept': 'application/json'
					},
					body: new URLSearchParams({
						usr: email,
						pwd: password
					}),
					credentials: 'include'
				})
				.then(response => response.json())
				.then(data => {
					if (data.message === 'Logged In') {
						resolve({ success: true });
					} else {
						resolve({
							success: false,
							message: data.message || 'Invalid credentials'
						});
					}
				})
				.catch(error => {
					console.error('Login fetch error:', error);
					reject(error);
				});
			}
		});
	}

	/**
	 * Get CSRF token from cookie
	 */
	function getCsrfToken() {
		const cookies = document.cookie.split(';');
		for (let cookie of cookies) {
			const [name, value] = cookie.trim().split('=');
			if (name === 'csrf_token') {
				return decodeURIComponent(value);
			}
		}
		return '';
	}

	/**
	 * Get redirect URL from query params or default
	 */
	function getRedirectUrl() {
		const urlParams = new URLSearchParams(window.location.search);
		const redirectTo = urlParams.get('redirect-to') || urlParams.get('redirect_to');

		if (redirectTo) {
			// Ensure the redirect is to a relative path (security measure)
			if (redirectTo.startsWith('/')) {
				return redirectTo;
			}
		}

		return '/app'; // Default redirect to desk
	}

	/**
	 * Show message to user
	 */
	function showMessage(message, type) {
		const messageDiv = document.getElementById('login-message');
		if (!messageDiv) return;

		messageDiv.textContent = message;
		messageDiv.className = 'form-message ' + type;
		messageDiv.style.display = 'block';

		// Auto-hide success messages
		if (type === 'success') {
			setTimeout(() => hideMessage(), 3000);
		}
	}

	/**
	 * Hide message
	 */
	function hideMessage() {
		const messageDiv = document.getElementById('login-message');
		if (messageDiv) {
			messageDiv.style.display = 'none';
		}
	}

	/**
	 * Set loading state for form
	 */
	function setLoadingState(loading) {
		const loginButton = document.getElementById('login-button');
		const buttonText = loginButton.querySelector('.button-text');
		const buttonLoader = loginButton.querySelector('.button-loader');
		const emailInput = document.getElementById('login_email');
		const passwordInput = document.getElementById('login_password');

		if (loading) {
			loginButton.disabled = true;
			buttonText.style.display = 'none';
			buttonLoader.style.display = 'inline-block';
			emailInput.disabled = true;
			passwordInput.disabled = true;
		} else {
			loginButton.disabled = false;
			buttonText.style.display = 'inline-block';
			buttonLoader.style.display = 'none';
			emailInput.disabled = false;
			passwordInput.disabled = false;
		}
	}

	/**
	 * Initialize real-time form validation
	 */
	function initFormValidation(form) {
		const emailInput = document.getElementById('login_email');
		const passwordInput = document.getElementById('login_password');

		// Email validation
		emailInput.addEventListener('blur', function() {
			if (emailInput.value.trim() === '') {
				emailInput.style.borderColor = '#fc8181';
			} else {
				emailInput.style.borderColor = '';
			}
		});

		// Password validation
		passwordInput.addEventListener('blur', function() {
			if (passwordInput.value === '') {
				passwordInput.style.borderColor = '#fc8181';
			} else {
				passwordInput.style.borderColor = '';
			}
		});

		// Reset border color on input
		emailInput.addEventListener('input', function() {
			emailInput.style.borderColor = '';
		});

		passwordInput.addEventListener('input', function() {
			passwordInput.style.borderColor = '';
		});
	}

	/**
	 * Check URL parameters for messages
	 */
	function checkUrlParams() {
		const urlParams = new URLSearchParams(window.location.search);

		// Check for logout message
		if (urlParams.get('logged_out') === '1') {
			showMessage('You have been logged out successfully', 'success');
		}

		// Check for session expired
		if (urlParams.get('session_expired') === '1') {
			showMessage('Your session has expired. Please log in again.', 'error');
		}

		// Check for error message
		const errorMsg = urlParams.get('error');
		if (errorMsg) {
			showMessage(decodeURIComponent(errorMsg), 'error');
		}
	}

	/**
	 * Handle Enter key in form fields
	 */
	document.addEventListener('keypress', function(e) {
		if (e.key === 'Enter') {
			const loginForm = document.getElementById('custom-login-form');
			const emailInput = document.getElementById('login_email');
			const passwordInput = document.getElementById('login_password');

			if (!loginForm) return;

			// If on email field, move to password
			if (document.activeElement === emailInput) {
				e.preventDefault();
				passwordInput.focus();
			}
			// If on password field, submit form
			else if (document.activeElement === passwordInput) {
				e.preventDefault();
				loginForm.dispatchEvent(new Event('submit'));
			}
		}
	});

	/**
	 * Add smooth focus transitions
	 */
	const inputs = document.querySelectorAll('.form-control');
	inputs.forEach(input => {
		input.addEventListener('focus', function() {
			this.parentElement.classList.add('focused');
		});

		input.addEventListener('blur', function() {
			this.parentElement.classList.remove('focused');
		});
	});

})();