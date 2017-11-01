require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module SomervilleTeacherTool
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # --- Student Insights additions below ---
    Rails.application.config.tap do |config|
      class_paths = [
        "#{config.root}/app/models",
        "#{config.root}/app/jobs",
        "#{config.root}/app/serializers",
        "#{config.root}/app/importers/clients",
        "#{config.root}/app/importers/data_transformers",
        "#{config.root}/app/importers/file_importers",
        "#{config.root}/app/importers/filters",
        "#{config.root}/app/importers/rows",
        "#{config.root}/app/importers/sources",
        "#{config.root}/app/importers/iep_import",
        "#{config.root}/app/importers/student_services",
        "#{config.root}/lib"
      ]

      config.eager_load_paths = (config.eager_load_paths + class_paths).uniq
      class_paths.each do |class_path|
        config.autoload_paths << class_path
      end

      config.generators do |g|
        g.stylesheets false
        g.javascripts false
        g.helpers false
      end
    end
  end
end
