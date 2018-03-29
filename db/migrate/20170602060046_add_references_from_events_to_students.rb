class AddReferencesFromEventsToStudents < ActiveRecord::Migration[5.0]
  def change
    add_reference :absences, :student, index: true, foreign_key: true
    add_reference :tardies, :student, index: true, foreign_key: true
    add_reference :discipline_incidents, :student, index: true, foreign_key: true
  end
end
