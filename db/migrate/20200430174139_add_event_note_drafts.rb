class AddEventNoteDrafts < ActiveRecord::Migration[6.0]
  def change
    create_table :event_note_drafts do |t|
      t.string :draft_key, null: false
      t.integer :student_id, null: false
      t.integer :educator_id, null: false
      t.integer :event_note_type_id, null: false
      t.boolean :is_restricted, default: false, null: false
      t.text :text, null: false
      t.timestamps
    end
    add_index :event_note_drafts, [:student_id, :educator_id, :draft_key], name: "event_note_drafts_unique_index", unique: true
  end
end
