class AddIdToEducatorSectionAssignments < ActiveRecord::Migration[5.1]
  def change
    add_column :educator_section_assignments, :id, :primary_key
  end
end
