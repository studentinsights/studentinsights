class RemoveAssociationBetweenEventsAndStudentSchoolYear < ActiveRecord::Migration[5.0]
  def change
    remove_column :absences, :student_school_year_id

    remove_column :tardies, :student_school_year_id

    remove_column :discipline_incidents, :student_school_year_id
  end
end
