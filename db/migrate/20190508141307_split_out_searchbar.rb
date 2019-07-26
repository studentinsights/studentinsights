# typed: true
class SplitOutSearchbar < ActiveRecord::Migration[5.2]
  def change
    create_table :educator_searchbars, id: :uuid do |t|
      t.integer :educator_id, null: false
      t.json :student_searchbar_json, null: false, default: '[]'
    end
    add_foreign_key :educator_searchbars, :educators
    add_index :educator_searchbars, :educator_id, unique: true
  end
end
