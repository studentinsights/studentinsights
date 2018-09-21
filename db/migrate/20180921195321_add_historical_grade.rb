class AddHistoricalGrade < ActiveRecord::Migration[5.2]
  def change
    create_table :historical_grades do |t|
      t.references :student
      t.references :section
      t.text :section_number
      t.text :course_number
      t.text :grade

      t.timestamps
    end
  end
end
