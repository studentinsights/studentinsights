class RenameAttendanceResultToAttendanceEvent < ActiveRecord::Migration
  def change
    rename_table :attendance_results, :attendance_events
  end
end
