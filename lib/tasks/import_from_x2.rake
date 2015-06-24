desc "Import students, attendance, & behavior info for all schools"
task :import_from_x2 => :environment do
  importers = [ StudentsImporter.new, AttendanceImporter.new, BehaviorImporter.new ]
  importers.each { |i| i.connect_to_x2_and_import }
end
