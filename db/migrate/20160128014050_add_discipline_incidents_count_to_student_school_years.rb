class AddDisciplineIncidentsCountToStudentSchoolYears < ActiveRecord::Migration
  def change
    add_column :student_school_years, :discipline_incidents_count, :integer, default: 0
  end
end
