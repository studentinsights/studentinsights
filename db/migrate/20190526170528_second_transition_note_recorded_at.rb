# typed: true
class SecondTransitionNoteRecordedAt < ActiveRecord::Migration[5.2]
  def change
    add_column :second_transition_notes, :recorded_at, :datetime, null: false
  end
end
