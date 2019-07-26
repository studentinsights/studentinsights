# typed: true
class AddGradeLevelEquivalentColumnToStudentAssessments < ActiveRecord::Migration[5.0]
  def change
    add_column :student_assessments, :grade_equivalent, :string
  end
end
