desc 'IEP PDF import'
namespace :student_photos do
  task import: :environment do
    StudentPhotoImporter.new.import
  end
end
