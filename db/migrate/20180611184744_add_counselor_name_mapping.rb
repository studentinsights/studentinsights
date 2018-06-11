class AddCounselorNameMapping < ActiveRecord::Migration[5.1]
  def change
    create_table :counselor_name_mappings do |t|
      t.text :counselor_field_text
      t.integer :educator_id

      t.timestamps
    end
  end
end
