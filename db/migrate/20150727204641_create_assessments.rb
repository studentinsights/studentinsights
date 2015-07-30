class CreateAssessments < ActiveRecord::Migration
  def change
    create_table :assessments do |t|
      t.integer :scale_score
      t.integer :growth_percentile
      t.string :performance_level
      t.integer :assessment_family_id
      t.integer :assessment_subject_id
      t.datetime :date_taken
      t.integer :student_id

      t.timestamps
    end
  end
end
