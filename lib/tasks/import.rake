desc "Import students, attendance, behavior, assessments"

task :import => :environment do

  school_id = ENV['SCHOOL_IMPORT_SCOPE']
  district_scope = ENV['DISTRICT_IMPORT_SCOPE']

  if school_id.present?
    school_scope = School.find_by_local_id(school_id)
    raise "School not found" if school_scope.blank?
  end

  settings = Settings.new({
    district_scope: district_scope,
    school_scope: school_scope
  }).configure
  puts "District: #{district_scope}"
  puts "School: #{school_id}" if school_id.present?

  ImportInitializer.import(settings)
end
