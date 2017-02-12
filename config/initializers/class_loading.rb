# Pulled out from application.rb as part of upgrading to Ruby 5
Rails.application.config.tap do |config|
  puts '  KR: tap'
  class_paths = [
    "#{config.root}/app/models",
    "#{config.root}/app/jobs",
    "#{config.root}/app/importers/clients",
    "#{config.root}/app/importers/data_transformers",
    "#{config.root}/app/importers/file_importers",
    "#{config.root}/app/importers/filters",
    "#{config.root}/app/importers/rows",
    "#{config.root}/app/importers/sources",
    "#{config.root}/app/importers/student_services",
    "#{config.root}/lib"
  ]
  config.eager_load_paths = (config.eager_load_paths + class_paths).uniq
  config.autoload_paths = (config.autoload_paths + class_paths).uniq

  config.generators do |g|
    g.stylesheets false
    g.javascripts false
    g.helpers false
  end
end