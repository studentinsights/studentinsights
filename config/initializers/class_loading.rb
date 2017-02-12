# Pulled out from application.rb as part of upgrading to Ruby 5
Rails.application.config.tap do |config|
  config.eager_load_paths += ["#{config.root}/app/models"]
  config.eager_load_paths += ["#{config.root}/app/jobs"]
  config.eager_load_paths += ["#{config.root}/app/importers/clients"]
  config.eager_load_paths += ["#{config.root}/app/importers/data_transformers"]
  config.eager_load_paths += ["#{config.root}/app/importers/file_importers"]
  config.eager_load_paths += ["#{config.root}/app/importers/filters"]
  config.eager_load_paths += ["#{config.root}/app/importers/rows"]
  config.eager_load_paths += ["#{config.root}/app/importers/sources"]
  config.eager_load_paths += ["#{config.root}/app/importers/student_services"]
  config.eager_load_paths += ["#{config.root}/lib"]

  config.generators do |g|
    g.stylesheets false
    g.javascripts false
    g.helpers false
  end
end