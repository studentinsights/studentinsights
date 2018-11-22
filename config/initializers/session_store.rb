# Be sure to restart your server when you modify this file.

Rails.application.config.session_store(:active_record_store, {
  domain: PerDistrict.new.canonical_domain,
  key: "_#{PerDistrict.new.district_key}_student_insights_session",
  secure: true
})
