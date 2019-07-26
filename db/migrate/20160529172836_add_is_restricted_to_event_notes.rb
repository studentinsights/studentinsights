# typed: true
class AddIsRestrictedToEventNotes < ActiveRecord::Migration[4.2]
  def change
    add_column :event_notes, :is_restricted, :boolean
  end
end
