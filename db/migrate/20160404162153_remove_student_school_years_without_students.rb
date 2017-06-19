class RemoveStudentSchoolYearsWithoutStudents < ActiveRecord::Migration[4.2]
  def change
    if defined? StudentSchoolYear
      StudentSchoolYear.find_each do |student_school_year|
        student_school_year.destroy if student_school_year.student.nil?
        student_school_year.destroy if student_school_year.school_year.nil?
      end
    end
  end
end
