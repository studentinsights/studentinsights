class RemoveAssessmentSubjectAndFamilyTables < ActiveRecord::Migration[5.1]
  def change
    drop_table :assessment_families
    drop_table :assessment_subjects
  end
end
