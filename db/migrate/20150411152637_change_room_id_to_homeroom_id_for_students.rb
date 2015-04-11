class ChangeRoomIdToHomeroomIdForStudents < ActiveRecord::Migration
  def change
    rename_column :students, :room_id, :homeroom_id
  end
end
