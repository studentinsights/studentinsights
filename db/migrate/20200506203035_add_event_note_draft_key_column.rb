class AddEventNoteDraftKeyColumn < ActiveRecord::Migration[6.0]
  def change
    add_column :event_notes, :draft_key, :text
    add_index :event_notes, [:educator_id, :student_id, :draft_key], name: "event_note_draft_keyindex"
  end
end
