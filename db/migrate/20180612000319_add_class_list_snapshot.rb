class AddClassListSnapshot < ActiveRecord::Migration[5.1]
  def change
    create_table :class_list_snapshots do |t|
      t.integer :class_list_id
      t.json :students_json

      t.timestamps
    end
  end
end
