# typed: true
class AddDefaultValueToIsRestricted < ActiveRecord::Migration[4.2]
  def up
    change_column :event_notes, :is_restricted, :boolean, :default => false
  end

  def down
    change_column :event_notes, :is_restricted, :boolean, :default => nil
  end
end
