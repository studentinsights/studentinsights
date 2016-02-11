class CreateEventNotes < ActiveRecord::Migration
  def change
    create_table :event_notes do |t|
      t.integer :student_id
      t.integer :educator_id
      t.integer :event_note_type_id
      t.text :text
      t.datetime :recorded_at

      t.timestamps
    end
  end
end
