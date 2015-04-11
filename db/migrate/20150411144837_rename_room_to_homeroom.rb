class RenameRoomToHomeroom < ActiveRecord::Migration
  def change
    rename_table :rooms, :homerooms
  end
end
