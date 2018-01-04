if Rails.env.production?
  SecureHeaders::Configuration.default do |config|
    config.x_download_options = nil
  end
end
