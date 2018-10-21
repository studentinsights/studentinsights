require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module SomervilleTeacherTool
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.1

    # see https://blog.bigbinary.com/2016/02/15/rails-5-makes-belong-to-association-required-by-default.html
    Rails.application.config.active_record.belongs_to_required_by_default = false

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # --- Student Insights additions below ---
    # See https://guides.rubyonrails.org/autoloading_and_reloading_constants.html#autoload-paths-and-eager-load-paths
    # This needs all sub-folders in app that are referenced without
    # a containing module.
    Rails.application.config.tap do |config|
      class_paths = [
        "#{config.root}/app/importers/clients",
        "#{config.root}/app/importers/constants",
        "#{config.root}/app/importers/data_transformers",
        "#{config.root}/app/importers/file_importers",
        "#{config.root}/app/importers/helpers",
        "#{config.root}/app/importers/iep_import",
        "#{config.root}/app/importers/photo_import",
        "#{config.root}/app/importers/precompute",
        "#{config.root}/app/importers/rows",
        "#{config.root}/app/importers/survey_note_importer",
        "#{config.root}/app/importers/team_membership_import",
        "#{config.root}/app/importers/tools"
      ]

      # The intention here is that we compress server responses
      # (eg, HTML and JSON) but not doubly-gzip static assets which
      # are already compressed on disk.
      #
      # However, when the middleware runs for mime types other than
      # application/json, it runs through the deflate code path but
      # doesn't seem to actually reduce the byte site.
      # See https://github.com/studentinsights/studentinsights/issues/1196#issuecomment-340269968
      config.middleware.use Rack::Deflater, include: [
        'application/json'
      ]

      config.eager_load_paths = (config.eager_load_paths + class_paths).uniq
      class_paths.each do |class_path|
        config.autoload_paths << class_path
      end

      config.generators do |g|
        g.stylesheets false
        g.javascripts false
        g.helper false
      end
    end
  end
end
