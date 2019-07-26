# typed: true
class UpdateDisciplineIncidentsAttributes < ActiveRecord::Migration[4.2]
  def change
    remove_column :discipline_incidents, :student_id, :integer
    remove_column :discipline_incidents, :school_year_id, :integer

    rename_column :discipline_incidents, :event_date, :occurred_at
    change_column_null :discipline_incidents, :occurred_at, false
    change_column_null :discipline_incidents, :created_at, false
    change_column_null :discipline_incidents, :updated_at, false

    change_column_null :discipline_incidents, :student_school_year_id, false
    add_index :discipline_incidents, [:student_school_year_id], name: "index_discipline_incidents_on_student_school_year_id", using: :btree
  end
end
