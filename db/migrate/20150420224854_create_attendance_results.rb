class CreateAttendanceResults < ActiveRecord::Migration
  def change
    create_table :attendance_results do |t|
      t.string :school_year
      t.integer :number_of_absences
      t.integer :number_of_tardies
      t.integer :student_id

      t.timestamps
    end
  end
end
