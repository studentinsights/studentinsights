class AddRoomIdToStudents < ActiveRecord::Migration
  def change
    add_column :students, :room_id, :integer
  end
end
