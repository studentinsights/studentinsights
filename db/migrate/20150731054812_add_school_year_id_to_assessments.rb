class AddSchoolYearIdToAssessments < ActiveRecord::Migration
  def change
    add_column :assessments, :school_year_id, :integer
  end
end
