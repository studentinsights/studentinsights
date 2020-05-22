class AddEventNoteDraftsForeignKeys < ActiveRecord::Migration[6.0]
  def change
    add_foreign_key "event_note_drafts", "educators", name: "event_note_drafts_educator_id_fk"
    add_foreign_key "event_note_drafts", "event_note_types", name: "event_note_drafts_event_note_type_id_fk"
    add_foreign_key "event_note_drafts", "students", name: "event_note_drafts_student_id_fk"
  end
end
