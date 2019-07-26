# typed: true
class CreateStudentSchoolYears < ActiveRecord::Migration[4.2]
  def change
    create_table :student_school_years do |t|
      t.integer :student_id
      t.integer :school_year_id

      t.timestamps
    end
  end
end
