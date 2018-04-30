class AddNewFieldsToAttendanceEvents < ActiveRecord::Migration[5.1]
  def change
    add_column :absences, :dismissed, :boolean
    add_column :absences, :excused, :boolean
    add_column :absences, :reason, :string
    add_column :absences, :comment, :string

    add_column :tardies, :dismissed, :boolean
    add_column :tardies, :excused, :boolean
    add_column :tardies, :reason, :string
    add_column :tardies, :comment, :string
  end
end
