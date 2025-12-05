import frappe
from frappe import _
from frappe.utils import cint

no_cache = 1


def get_context(context):
	"""Context for custom login page"""

	# Redirect to desk if already logged in
	if frappe.session.user != "Guest":
		frappe.local.flags.redirect_location = "/app"
		raise frappe.Redirect

	# Set context variables
	context.no_cache = 1
	context.show_sidebar = False

	# Get signup configuration - check if the field exists
	try:
		# Try to get from Website Settings
		context.allow_signups = cint(frappe.db.get_single_value("Website Settings", "disable_signup") or 0) == 0
	except Exception:
		# Fallback - check System Settings or default to False
		try:
			context.allow_signups = cint(frappe.db.get_single_value("System Settings", "allow_signups") or 0)
		except Exception:
			context.allow_signups = 0

	# Brand information
	context.brand_name = "XeERP"
	context.brand_tagline = "Powered by XenonLabs"

	# Current year for copyright
	from datetime import datetime
	context.current_year = datetime.now().year

	# Get redirect-to parameter if exists
	redirect_to = frappe.form_dict.redirect_to
	if redirect_to:
		context.redirect_to = redirect_to

	return context