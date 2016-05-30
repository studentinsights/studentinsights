class AddIsRestrictedToEventNotes < ActiveRecord::Migration
  def change
    add_column :event_notes, :is_restricted, :boolean
  end
end
