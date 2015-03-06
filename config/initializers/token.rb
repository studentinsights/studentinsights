Homeroom::Application.config.secret_key_base = if Rails.env.development? or Rails.env.test? 
  (0...32).map { ('a'..'z').to_a[rand(26)] }.join
else
  ENV['SECRET_TOKEN']
end