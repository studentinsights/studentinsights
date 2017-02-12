class CreateEventNoteTypes < ActiveRecord::Migration[4.2]
  def change
    create_table :event_note_types do |t|
      t.string :name

      t.timestamps
    end

    EventNoteType.seed_somerville_event_note_types
  end
end
