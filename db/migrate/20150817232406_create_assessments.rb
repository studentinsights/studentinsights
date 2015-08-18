class CreateAssessments < ActiveRecord::Migration
  def change
    create_table :assessments do |t|
      t.string :name
      t.string :family
      t.string :subject

      t.timestamps
    end
  end
end
