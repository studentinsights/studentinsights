desc "Import students, attendance, behavior, assessments"
  # In the Somerville context, rake import => imports for all schools
  # rake import[HEA] => imports for just Healey School
  # rake import[BRN] => imports for just Brown School
  # See schools.seeds.rb for Somerville school local_ids

task :import, [:school] => :environment do |task, args|
  if args[:school].present?
    school = School.find_by_local_id(args[:school])
    raise "School not found" if school.blank?
  end
  settings = Settings.new({district_scope: "Somerville", school_scope: school}).configure
  ImportInitializer.import(settings)
end
