class RemoveStudentStateIdConstraint < ActiveRecord::Migration[5.2]
  def change
    change_column :students, :state_id, :string, null: true
  end
end
