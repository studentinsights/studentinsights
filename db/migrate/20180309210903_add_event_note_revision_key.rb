class AddEventNoteRevisionKey < ActiveRecord::Migration[5.1]
  def change
    add_foreign_key "event_note_revisions", "educators", name: "event_note_revisions_educator_id_fk"
  end
end
