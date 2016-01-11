require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module SomervilleTeacherTool
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    config.autoload_paths += %W(#{config.root}/app/models)
    config.autoload_paths += %W(#{config.root}/app/importers/clients)
    config.autoload_paths += %W(#{config.root}/app/importers/settings)
    config.autoload_paths += %W(#{config.root}/app/importers/data_transformers)
    config.autoload_paths += %W(#{config.root}/app/dashboard_queries)
    config.autoload_paths += %W(#{config.root}/lib)

    require 'pdfkit'
    config.middleware.use PDFKit::Middleware

    config.generators do |g|
      g.stylesheets false
      g.javascripts false
      g.test_framework :rspec, fixture_replacement: :factory_girl
    end

    console do
      # :nocov:
      ActiveRecord::Base.connection
      # :nocov:
    end

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de
  end
end
