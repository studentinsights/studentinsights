class AddTimestamps < ActiveRecord::Migration[5.2]
  def change
    add_column :student_section_assignments, :created_at, :datetime
    add_column :student_section_assignments, :updated_at, :datetime
    add_column :educator_section_assignments, :created_at, :datetime
    add_column :educator_section_assignments, :updated_at, :datetime

    # see also data_migrations:timestamps_for_section_join_tables rake task, which
    # is intended to be run after this migration
  end
end
