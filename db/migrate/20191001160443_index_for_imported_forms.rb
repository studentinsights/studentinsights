class IndexForImportedForms < ActiveRecord::Migration[5.2]
  def change
    add_index :imported_forms, :student_id
    add_index :imported_forms, :form_key
  end
end
