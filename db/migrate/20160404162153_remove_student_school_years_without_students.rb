class RemoveStudentSchoolYearsWithoutStudents < ActiveRecord::Migration
  def change
    StudentSchoolYear.find_each do |student_school_year|
      student_school_year.destroy if student_school_year.student.nil?
      student_school_year.destroy if student_school_year.school_year.nil?
    end
  end
end
