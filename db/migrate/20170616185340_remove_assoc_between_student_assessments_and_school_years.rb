class RemoveAssocBetweenStudentAssessmentsAndSchoolYears < ActiveRecord::Migration[5.0]
  def change
    remove_column :student_assessments, :school_year_id
    remove_column :student_assessments, :student_school_year_id
  end
end
