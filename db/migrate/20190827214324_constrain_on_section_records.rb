class ConstrainOnSectionRecords < ActiveRecord::Migration[5.2]
  def change
    # `section_number` should be unique upstream in district SIS systems, when scoped by school year and term.
    add_index :sections, [:course_id, :district_school_year, :term_local_id, :section_number], unique: true, name: :sections_uniqueness_constraint
  end
end
