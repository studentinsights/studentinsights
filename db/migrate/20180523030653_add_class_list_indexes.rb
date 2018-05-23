class AddClassListIndexes < ActiveRecord::Migration[5.1]
  def change
    add_index(:class_lists, [:workspace_id, :created_at], order: {
      workspace_id: :asc,
      created_at: :desc
    })
  end
end
