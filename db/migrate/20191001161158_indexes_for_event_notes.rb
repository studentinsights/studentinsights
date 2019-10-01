class IndexesForEventNotes < ActiveRecord::Migration[5.2]
  def change
    add_index :event_notes, :student_id
    add_index :event_notes, :recorded_at
    add_index :event_notes, :is_restricted
  end
end
