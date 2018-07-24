class EventNoteRevisionsKey < ActiveRecord::Migration[5.2]
  def change
    add_foreign_key "event_note_revisions", "students", name: "event_note_revisions_student_id_fk"
  end
end
