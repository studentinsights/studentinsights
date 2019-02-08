class AddImportedFormsModel < ActiveRecord::Migration[5.2]
  def change
    create_table :imported_forms do |t|
      t.integer :student_id, null: false
      t.datetime :form_timestamp, null: false
      t.text :form_key, null: false
      t.text :form_url, null: false
      t.json :form_json, null: false
      t.integer :educator_id, null: false
      t.timestamps
    end
    add_foreign_key :imported_forms, :students
    add_foreign_key :imported_forms, :educators
  end
end
