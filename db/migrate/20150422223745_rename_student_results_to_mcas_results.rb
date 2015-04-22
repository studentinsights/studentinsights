class RenameStudentResultsToMcasResults < ActiveRecord::Migration
  def change
    rename_table :student_results, :mcas_results
  end
end
