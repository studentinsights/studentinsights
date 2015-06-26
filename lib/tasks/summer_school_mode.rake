desc "Hacky method to create SOMERSCHOOL MODE!"
task :summer_school_mode => :environment do

  # 1. Import all the students
  importers = [
    StudentsImporter.new,
    AttendanceImporter.new,
    BehaviorImporter.new,
    McasImporter.new,
    StarMathImporter.new,
    StarReadingImporter.new
  ]
  importers.each { |i| i.connect_and_import }

  # 2. Get list of students in summer school
  file_path = "#{Rails.root}/data/SomerschoolRegistration.csv"  # Should have "state id" and "registered" columns
  summer_school_csv = CSV.new(File.open(file_path), headers: true, header_converters: :symbol)
  summer_school_student_ids = summer_school_csv.map { |row| row[:state_id] }

  # 3. Destroy the homerooms because homerooms don't apply in summer school
  Homeroom.destroy_all

  # 4. Destroy records for students who aren't in summer school
  Student.find_each do |s|
    if !(summer_school_student_ids.include? s.state_id)
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
