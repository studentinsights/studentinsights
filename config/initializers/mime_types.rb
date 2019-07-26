# typed: strict
# Be sure to restart your server when you modify this file.

# Add new mime types for use in respond_to blocks:
# Mime::Type.register "text/richtext", :rtf

# ---- Student Insights additions ----
Mime::Type.register 'application/pdf', :pdf unless Mime::Type.lookup_by_extension(:pdf)