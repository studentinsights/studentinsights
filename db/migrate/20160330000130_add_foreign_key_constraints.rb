class AddForeignKeyConstraints < ActiveRecord::Migration
  def change
    add_foreign_key :event_notes, :educators
    add_foreign_key :event_notes, :students
    add_foreign_key :event_notes, :event_note_types
    add_foreign_key :progress_notes, :interventions
    add_foreign_key :progress_notes, :educators
    add_foreign_key :services, :educators, column: :recorded_by_educator_id
    add_foreign_key :services, :educators, column: :provided_by_educator_id
    add_foreign_key :services, :students
    add_foreign_key :services, :service_types
    add_foreign_key :student_assessments, :students
  end
end
