desc "Import district data from X2"

task :import_district_data => :environment do

  require 'data_helpers'

  Student.destroy_all

  # Get student table from x2
  ActiveRecord::Base.establish_connection(:x2_database_development)
  @sql = "SELECT DISTINCT * from student"
  @result = ActiveRecord::Base.connection.exec_query(@sql).to_hash
  @size = @result.size
  puts "#{@size} results from student table in X2."

  # Switch connection over to main psql db to update students table
  ActiveRecord::Base.establish_connection(:development)

  @result.each do |row|

    name = row["std_name_view"]
    state_id = row["STD_ID_STATE"]
    enrollment_status = row["STD_ENROLLMENT_STATUS"]

    if name.present? && state_id.present? && enrollment_status == "Active"
      new_student = Student.new
      name = name.gsub(",NULL","")
      first_name = name.split(", ")[1]
      last_name = name.split(", ")[0]
      free_lunch = DataHelper::FREE_REDUCED_LUNCH_TO_LOW_INCOME[row["STD_FIELDB_031"]]
      limited_english = row["STD_FIELDB_036"]
      grade = row["STD_GRADE_LEVEL"]
      race = row["STD_FIELDA_002"]
      home_language = row["STD_HOME_LANGUAGE_CODE"]

      new_student.attributes(
        first_name: first_name,
        last_name: last_name,
        state_identifier: state_id,
        low_income: free_lunch,
        limited_english: limited_english,
        grade: grade,
        home_language: home_language
      )
      new_student.save

      room_name = row["STD_HOMEROOM"]
      room = Room.where(name: room_name).first_or_create
      new_student.room_id = room.id
      new_student.save
    end
  end

  ActiveRecord::Base.connection.close
  puts "#{Student.all.size} student records."

end