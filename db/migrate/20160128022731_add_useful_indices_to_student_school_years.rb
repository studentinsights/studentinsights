# typed: true
class AddUsefulIndicesToStudentSchoolYears < ActiveRecord::Migration[4.2]
  def change
    change_column_null :student_school_years, :student_id, false
    change_column_null :student_school_years, :school_year_id, false
    change_column_null :student_school_years, :created_at, false
    change_column_null :student_school_years, :updated_at, false

    add_index :student_school_years, [:student_id, :school_year_id], name: "index_student_school_years_on_student_id_and_school_year_id", using: :btree, unique: true
  end
end
