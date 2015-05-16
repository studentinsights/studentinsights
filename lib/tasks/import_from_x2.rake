desc "Import student, attendance, & behavior info from X2 remote server"
task :import_from_x2 => :environment do
  importers = [ StudentsImporter.new, AttendanceImporter.new, BehaviorImporter.new ]
  importers.each { |i| i.import_from_x2 }
end
