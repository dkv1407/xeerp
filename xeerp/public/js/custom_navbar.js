/**
 * XeERP - Custom Navbar Logo
 * Replaces default ERPNext logo with XeERP branding
 */

(function() {
	'use strict';

	// Replace logo on page load
	function replaceNavbarLogo() {
		// Find the navbar logo
		const logoElements = document.querySelectorAll('.navbar-brand .app-logo, .navbar-brand img');

		logoElements.forEach(logo => {
			logo.src = '/assets/xeerp/images/xeerp-logo.svg';
			if (logo && (logo.src.includes('erpnext') || logo.src.includes('frappe'))) {
				// Replace with XeERP logo
				logo.src = '/assets/xeerp/images/xeerp-logo.svg';
				logo.alt = 'XeERP';
				logo.style.height = '40px';
				logo.style.width = 'auto';
				logo.style.filter = 'none';
			}
		});

		// Alternative: If img doesn't exist, update navbar-brand directly
		const navbarBrand = document.querySelector('.navbar-brand.navbar-home');
		if (navbarBrand && !navbarBrand.querySelector('img[src*="xeerp"]')) {
			// Check if logo wasn't already replaced
			const existingLogo = navbarBrand.querySelector('.app-logo');
			if (existingLogo && !existingLogo.src.includes('xeerp')) {
				existingLogo.src = '/assets/xeerp/images/xeerp-logo.svg';
				existingLogo.alt = 'XeERP';
				existingLogo.style.height = '40px';
				existingLogo.style.width = 'auto';
				existingLogo.style.filter = 'none';
			}
		}
	}

	// Run on DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', replaceNavbarLogo);
	} else {
		replaceNavbarLogo();
	}

	// Run after a short delay to catch dynamically loaded content
	setTimeout(replaceNavbarLogo, 500);

	// Watch for navigation changes (for single-page app behavior)
	if (window.frappe) {
		frappe.router.on('change', replaceNavbarLogo);
	}

})();