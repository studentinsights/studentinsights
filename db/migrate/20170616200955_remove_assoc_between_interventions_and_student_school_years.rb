class RemoveAssocBetweenInterventionsAndStudentSchoolYears < ActiveRecord::Migration[5.0]
  def change
    remove_column :interventions, :school_year_id
    remove_column :interventions, :student_school_year_id
  end
end
