class AddSchoolYearIdToMcasResultAndStarResult < ActiveRecord::Migration
  def change
    add_column :mcas_results, :school_year_id, :integer
    add_column :star_results, :school_year_id, :integer
  end
end
