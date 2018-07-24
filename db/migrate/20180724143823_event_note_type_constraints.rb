class EventNoteTypeConstraints < ActiveRecord::Migration[5.2]
  def change
    add_foreign_key :event_notes, :event_note_types
    add_foreign_key :event_note_revisions, :event_note_types
    add_foreign_key :event_note_revisions, :event_notes
  end
end
