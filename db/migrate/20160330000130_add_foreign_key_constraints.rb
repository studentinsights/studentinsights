class AddForeignKeyConstraints < ActiveRecord::Migration
  def change
    add_foreign_key :absences, :student_school_years
    add_foreign_key :discipline_incidents, :student_school_years
    add_foreign_key :educators, :schools
    add_foreign_key :event_notes, :educators
    add_foreign_key :event_notes, :students
    add_foreign_key :event_notes, :event_note_types
    add_foreign_key :homerooms, :educators
    add_foreign_key :interventions, :students
    add_foreign_key :interventions, :intervention_types
    add_foreign_key :interventions, :educators
    add_foreign_key :interventions, :school_years
    add_foreign_key :interventions, :student_school_years
    add_foreign_key :progress_notes, :interventions
    add_foreign_key :progress_notes, :educators
    add_foreign_key :services, :educators, column: :recorded_by_educator_id
    add_foreign_key :services, :educators, column: :provided_by_educator_id
    add_foreign_key :services, :students
    add_foreign_key :services, :service_types
    add_foreign_key :student_assessments, :students
    add_foreign_key :student_assessments, :school_years
    add_foreign_key :student_assessments, :assessments
    add_foreign_key :student_assessments, :student_school_years
    add_foreign_key :student_notes, :students
    add_foreign_key :student_notes, :educators
    add_foreign_key :student_risk_levels, :students
    add_foreign_key :student_school_years, :students
    add_foreign_key :students, :homerooms
    add_foreign_key :students, :schools
    add_foreign_key :tardies, :student_school_years
  end
end
