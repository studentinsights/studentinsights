class RelaxEventNoteDraftValidations < ActiveRecord::Migration[6.0]
  def change
    change_column :event_note_drafts, :event_note_type_id, :integer, null: true
  end
end
