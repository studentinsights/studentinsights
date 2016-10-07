desc 'Bulk services import'
task import_services: :environment do
  StudentServiceImporter.new.import
end
