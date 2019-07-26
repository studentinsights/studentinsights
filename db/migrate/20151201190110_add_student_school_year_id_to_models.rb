# typed: true
class AddStudentSchoolYearIdToModels < ActiveRecord::Migration[4.2]
  def change
    add_column :student_assessments, :student_school_year_id, :integer
    add_column :attendance_events, :student_school_year_id, :integer
    add_column :discipline_incidents, :student_school_year_id, :integer
    add_column :interventions, :student_school_year_id, :integer
  end
end
