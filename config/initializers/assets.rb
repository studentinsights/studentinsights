# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
# Rails.application.config.assets.precompile += %w( search.js )

# Don't require templates to all be under the same /templates folder
HandlebarsAssets::Config.path_prefix = ''

# react-rails configuration
if Rails.env.production?
  Rails.application.config.react.variant = :production
else
  Rails.application.config.react.variant = :development
  Rails.application.config.react.addons = true
end