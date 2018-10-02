class SectionConstraints < ActiveRecord::Migration[5.2]
  def change
    change_column :sections, :section_number, :string, null: false
    change_column :sections, :term_local_id, :string, null: false
  end
end
