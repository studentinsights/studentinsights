desc "Import students, attendance, behavior, assessments"
  # rake import => imports for all schools
  # rake import[HEA] => imports for just Healey School
  # rake import[BRN] => imports for just Brown School
  # See schools.seeds.rb for Somerville school local_ids

task :import, [:school] => :environment do |task, args|
  school_arg = {}
  if args[:school].present?
    school = School.where(local_id: args[:school]).first
    if school.present?
      school_arg = { school: school }
    end
  end
  import_classes = [
    StudentsImporter,
    AttendanceImporter,
    BehaviorImporter,
    McasImporter,
    StarMathImporter,
    StarReadingImporter
  ]
  import_classes.each { |i| i.new(school_arg).connect_and_import }
end
