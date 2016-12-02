class CreateEventNoteAttachments < ActiveRecord::Migration
  def change
    create_table :event_note_attachments do |t|
      t.string :url, null: false
      t.integer :event_note_id, null: false

      t.timestamps null: false
    end
  end
end
