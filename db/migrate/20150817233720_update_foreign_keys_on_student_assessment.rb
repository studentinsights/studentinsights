class UpdateForeignKeysOnStudentAssessment < ActiveRecord::Migration
  def change
    add_column :student_assessments, :assessment_id, :integer
    remove_column :student_assessments, :assessment_family_id
    remove_column :student_assessments, :assessment_subject_id
  end
end
