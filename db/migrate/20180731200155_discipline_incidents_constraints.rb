class DisciplineIncidentsConstraints < ActiveRecord::Migration[5.2]
  def change
    # This was nullable before and it shouldn't be.
    change_column :discipline_incidents, :student_id, :integer, null: false
  end
end
