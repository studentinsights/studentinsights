# typed: false
class DestroyStudentAssessmentsWithNoStudents < ActiveRecord::Migration[4.2]
  def change
    StudentAssessment.find_each do |student_assessment|
      student_id = student_assessment.student_id
      student = Student.find_by_id(student_id)
      student_assessment.destroy if student.nil?
    end
  end
end
