desc "Hacky method to create SOMERSCHOOL MODE!"
task :summer_school_mode => :environment do

  # 1. Import all the students
  Importer.import_all

  # 2. Get list of students in summer school
  file_path = "#{Rails.root}/data/SomerschoolRegistration.csv"  # Should have "lasid" (locally assigned student ID) and "registered" columns
  summer_school_csv = CSV.new(File.open(file_path), headers: true, header_converters: :symbol)
  summer_school_student_ids = summer_school_csv.map { |row| row[:lasid] }

  # 3. Destroy the homerooms because homerooms don't apply in summer school
  Homeroom.destroy_all

  # 4. Destroy records for students who aren't in summer school
  Student.find_each do |s|
    if !(summer_school_student_ids.include? s.local_id)
      s.destroy
    elsif s[:status] != 'Registered'
      s.destroy
    else
  # 5. Make new homerooms that represent grade levels because that's how summer school works
      grade_level = s.grade
      homeroom = Homeroom.where(name: grade_level).first_or_create!
      s.homeroom_id = homeroom.id
      s.save
    end
  end
end
