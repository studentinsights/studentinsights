desc "Import students, attendance, & behavior info for Healey school"
task :import_healey_from_x2 => :environment do
  healey_school = School.where(local_id: "HEA").first_or_create!
  if healey_school.present?
    importers = [
      StudentsImporter.new(school: healey_school),
      AttendanceImporter.new(school: healey_school),
      BehaviorImporter.new(school: healey_school)
    ]
    importers.each { |i| i.connect_to_x2_and_import }
  end
end
