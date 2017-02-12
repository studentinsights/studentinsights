# Pulled out from application.rb as part of upgrading to Ruby 5
Rails.application.config.tap do |config|
  config.autoload_paths += %W(#{config.root}/app/models)
  config.autoload_paths += %W(#{config.root}/app/jobs)
  config.autoload_paths += %W(#{config.root}/app/importers/clients)
  config.autoload_paths += %W(#{config.root}/app/importers/data_transformers)
  config.autoload_paths += %W(#{config.root}/app/importers/file_importers)
  config.autoload_paths += %W(#{config.root}/app/importers/filters)
  config.autoload_paths += %W(#{config.root}/app/importers/rows)
  config.autoload_paths += %W(#{config.root}/app/importers/sources)
  config.autoload_paths += %W(#{config.root}/app/importers/student_services)
  config.autoload_paths += %W(#{config.root}/lib)

  config.generators do |g|
    g.stylesheets false
    g.javascripts false
    g.helpers false
  end
end