class HomeworkHelpEducatorId < ActiveRecord::Migration[5.2]
  def change
    add_column :homework_help_sessions, :recorded_by_educator_id, :integer, null: false
  end
end
