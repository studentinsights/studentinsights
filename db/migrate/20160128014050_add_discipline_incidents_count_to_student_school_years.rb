# typed: true
class AddDisciplineIncidentsCountToStudentSchoolYears < ActiveRecord::Migration[4.2]
  def change
    add_column :student_school_years, :discipline_incidents_count, :integer, default: 0
  end
end
