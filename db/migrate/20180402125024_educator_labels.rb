class EducatorLabels < ActiveRecord::Migration[5.1]
  def change
    create_table :educator_labels do |t|
      t.integer :educator_id
      t.text :label_key
      t.timestamps
    end
  end
end
