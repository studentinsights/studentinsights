class CreateAssessmentSubjects < ActiveRecord::Migration
  def change
    create_table :assessment_subjects do |t|
      t.string :name

      t.timestamps
    end
  end
end
