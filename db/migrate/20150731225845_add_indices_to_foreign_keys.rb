class AddIndicesToForeignKeys < ActiveRecord::Migration
  def change
    add_index :attendance_events, :student_id
    add_index :attendance_events, :school_year_id
    add_index :homerooms, :educator_id
    add_index :schools, :state_id
    add_index :schools, :local_id
    add_index :discipline_incidents, :student_id
    add_index :discipline_incidents, :school_year_id
    add_index :assessments, :assessment_family_id
    add_index :assessments, :assessment_subject_id
    add_index :assessments, :student_id
    add_index :assessments, :school_year_id
    add_index :students, :homeroom_id
    add_index :students, :state_id
    add_index :students, :school_id
    add_index :students, :local_id
  end
end
