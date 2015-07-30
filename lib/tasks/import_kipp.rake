task :import_kipp => :environment do
  config = ImportInitializer.import_kippnj_config
  ImportInitializer.import(config)
end
