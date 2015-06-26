desc "Import students, attendance, behavior, assessments"
task :import, [:school] => :environment do |task, args|
  if args[:school].nil?
    importers = [
      StudentsImporter.new,
      AttendanceImporter.new,
      BehaviorImporter.new,
      McasImporter.new,
      StarMathImporter.new,
      StarReadingImporter.new
    ]
  else
    school = School.where(local_id: args[:school]).first
    importers = [
      StudentsImporter.new(school: school),
      AttendanceImporter.new(school: school),
      BehaviorImporter.new(school: school),
      McasImporter.new(school: school),
      StarMathImporter.new(school: school),
      StarReadingImporter.new(school: school)
    ]
  end
  importers.each { |i| i.connect_and_import }
end
