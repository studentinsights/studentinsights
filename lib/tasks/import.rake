desc "Import students, attendance, behavior, assessments"
task :import => :environment do
  importers = [
    StudentsImporter.new,
    AttendanceImporter.new,
    BehaviorImporter.new,
    McasImporter.new,
    StarMathImporter.new,
    StarReadingImporter.new
  ]
  importers.each { |i| i.connect_and_import }
end
