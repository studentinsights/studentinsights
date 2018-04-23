class CreateClassroomsForGrades < ActiveRecord::Migration[5.1]
  def change
    create_table :classrooms_for_grades do |t|
      t.string :balance_id
      t.integer :created_by_educator_id
      t.integer :school_id
      t.string :grade_level_next_year
      t.json :json

      t.timestamps
      t.index :balance_id, unique: true
    end
  end
end
