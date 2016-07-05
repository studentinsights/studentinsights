class AddDefaultValueToIsRestricted < ActiveRecord::Migration
  def up
    change_column :event_notes, :is_restricted, :boolean, :default => false
  end

  def down
    change_column :event_notes, :is_restricted, :boolean, :default => nil
  end
end
