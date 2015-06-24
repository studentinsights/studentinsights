desc "Import STAR assessment results for Healey School"
task :import_healey_from_star => :environment do
  healey_school = School.where(local_id: "HEA").first_or_create!
  if healey_school.present?
    importers = [
      StarMathImporter.new(school: healey_school),
      StarReadingImporter.new(school: healey_school)
    ]
    importers.each { |i| i.connect_to_star_and_import }
  end
end
