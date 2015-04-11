class X2Importer < Struct.new(:school, :grade)

  def connect_to_x2
    ActiveRecord::Base.establish_connection(:x2_database_development)
    @sql = "SELECT DISTINCT * from student"
    @result = ActiveRecord::Base.connection.exec_query(@sql).to_hash
    ActiveRecord::Base.connection.close
    @result
  end

  def import(result)
    ActiveRecord::Base.establish_connection(:development)
    @result.each do |row|
      state_id = row["STD_ID_STATE"]
      enrollment_status = row["STD_ENROLLMENT_STATUS"]
      this_grade = row["STD_GRADE_LEVEL"]

      if state_id.present? && enrollment_status == "Active"
        if this_grade == grade && s == school
          student = Student.where(state_identifier: state_id).first_or_create!
          home_language = row["STD_HOME_LANGUAGE_CODE"]
          student.update_attributes(
            home_language: home_language
          )
          homeroom_name = row["STD_HOMEROOM"]
          homeroom = Homeroom.where(name: homeroom_name).first_or_create!
          student.homeroom_id = homeroom.id
          student.save
        end
      end
    end
  end
end