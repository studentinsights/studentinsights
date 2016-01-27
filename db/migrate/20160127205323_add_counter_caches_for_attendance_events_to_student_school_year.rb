class AddCounterCachesForAttendanceEventsToStudentSchoolYear < ActiveRecord::Migration
  def change
    add_column :student_school_years, :tardies_count, :integer, default: 0
    add_column :student_school_years, :absences_count, :integer, default: 0
  end
end
