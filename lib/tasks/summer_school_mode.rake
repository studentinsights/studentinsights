desc "Hacky method to create SOMERSCHOOL MODE!"
task :summer_school_mode => :environment do

  # 1. Get list of students in summer school
  file_path = "#{Rails.root}/data/SomerschoolRegistration.csv"  # Should have "lasid" (locally assigned student ID) and "registered" columns
  summer_school_csv = CSV.new(File.open(file_path), headers: true, header_converters: :symbol)
  summer_school_local_ids = summer_school_csv.select { |row| row[:status] == 'Registered' }.map { |row| row[:lasid] }

  # 2. Import the summer school
  ImportInitializer.import_all({summer_school_local_ids: summer_school_local_ids})

  # 3. Destroy the homerooms because homerooms don't apply in summer school
  Homeroom.destroy_all

  # 4. Destroy records for students who aren't in summer school
  Student.find_each do |s|
    grade_level = s.grade
    homeroom = Homeroom.where(name: grade_level).first_or_create!
    s.homeroom_id = homeroom.id
    s.save
  end
end
