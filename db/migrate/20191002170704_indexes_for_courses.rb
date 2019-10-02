class IndexesForCourses < ActiveRecord::Migration[5.2]
  def change
    # Different courses at different schools can have the same course number, but the
    # combination is unique.
    add_index :courses, [:course_number, :school_id], unique: true, name: :course_number_unique_within_school
  end
end
