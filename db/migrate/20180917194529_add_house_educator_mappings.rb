class AddHouseEducatorMappings < ActiveRecord::Migration[5.2]
  def change
    create_table :house_educator_mappings do |t|
      t.text :house_field_text
      t.integer :educator_id

      t.timestamps
    end
  end
end
