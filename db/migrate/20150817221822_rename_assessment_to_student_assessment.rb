class RenameAssessmentToStudentAssessment < ActiveRecord::Migration
  def change
    rename_table :assessments, :student_assessments
  end
end
