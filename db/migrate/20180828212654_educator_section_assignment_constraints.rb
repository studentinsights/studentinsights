class EducatorSectionAssignmentConstraints < ActiveRecord::Migration[5.2]
  def change
    change_column :educator_section_assignments, :section_id, :integer, null: false
    change_column :educator_section_assignments, :educator_id, :integer, null: false
  end
end
