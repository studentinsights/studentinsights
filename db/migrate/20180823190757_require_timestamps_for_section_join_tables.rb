class RequireTimestampsForSectionJoinTables < ActiveRecord::Migration[5.2]
  def change
    change_column :student_section_assignments, :created_at, :datetime, null: false
    change_column :student_section_assignments, :updated_at, :datetime, null: false
    change_column :educator_section_assignments, :created_at, :datetime, null: false
    change_column :educator_section_assignments, :updated_at, :datetime, null: false
  end
end
