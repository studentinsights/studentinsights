class DropSchoolYears < ActiveRecord::Migration[5.0]
  def change
    drop_table :school_years
    drop_table :student_school_years
  end
end
