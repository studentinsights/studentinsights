class AddEventDateToAttendanceResult < ActiveRecord::Migration
  def change
    add_column :attendance_results, :event_date, :datetime
  end
end
