class ChangeAttendanceResultToBeLessAggregated < ActiveRecord::Migration
  def change
    remove_column :attendance_results, :number_of_absences
    remove_column :attendance_results, :number_of_tardies
    remove_column :attendance_results, :school_year
    add_column :attendance_results, :absence, :boolean
    add_column :attendance_results, :tardy, :boolean
    add_column :attendance_results, :school_year_id, :integer
  end
end
