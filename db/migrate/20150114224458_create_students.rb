class CreateStudents < ActiveRecord::Migration
  def change
    create_table :students do |t|
      t.integer :new_id
      t.string :grade
      t.boolean :hispanic_latino
      t.string :race
      t.boolean :limited_english
      t.boolean :low_income

      t.timestamps
    end
  end
end
