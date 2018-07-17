class AbsenceNotNull < ActiveRecord::Migration[5.2]
  def change
    # This was nullable before and it shouldn't be.
    change_column :absences, :student_id, :integer, null: false
    change_column  :tardies, :student_id, :integer, null: false

    # This was a datetime, but logically it's a date and we want to enforce uniqueness
    # by date.
    change_column :absences, :occurred_at, :date, null: false
    change_column  :tardies, :occurred_at, :date, null: false
  end
end
