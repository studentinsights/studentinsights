# typed: true
class RemoveAbsenceAndTardyCountsFromStudent < ActiveRecord::Migration[4.2]
  def up
    remove_column :students, :absences_count_most_recent_school_year
    remove_column :students, :tardies_count_most_recent_school_year
  end

  def down
    add_column :students, :absences_count_most_recent_school_year, :integer, default: 0
    add_column :students, :tardies_count_most_recent_school_year, :integer, default: 0
  end
end
