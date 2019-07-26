# typed: true
class AddCounterCachesForAttendanceEventsToStudentSchoolYear < ActiveRecord::Migration[4.2]
  def change
    add_column :student_school_years, :tardies_count, :integer, default: 0
    add_column :student_school_years, :absences_count, :integer, default: 0
  end
end
