desc "Import students, attendance, behavior, assessments"
task :import, [:school] => :environment do |task, args|
  school_arg = {}
  if args[:school].present?
    school = School.where(local_id: args[:school]).first
    if school.present?
      school_arg = { school: school }
    end
  end
  importers = [
    StudentsImporter.new(school_arg),
    AttendanceImporter.new(school_arg),
    BehaviorImporter.new(school_arg),
    McasImporter.new(school_arg),
    StarMathImporter.new(school_arg),
    StarReadingImporter.new(school_arg)
  ]
  importers.each { |i| i.connect_and_import }
end
