class CreateAssessmentFamilies < ActiveRecord::Migration
  def change
    create_table :assessment_families do |t|
      t.string :name

      t.timestamps
    end
  end
end
