class AddEventNoteSourceJson < ActiveRecord::Migration[5.2]
  def change
    add_column :event_notes, :source_json, :json, default: nil, null: true
  end
end
