if Rails.env.production?
  SecureHeaders::Configuration.default
end
