# typed: true
class AddMostRecentStudentAssessmentResultsToStudent < ActiveRecord::Migration[4.2]
  def change
    add_column :students, :most_recent_mcas_math_growth, :integer
    add_column :students, :most_recent_mcas_ela_growth, :integer
    add_column :students, :most_recent_mcas_math_performance, :string
    add_column :students, :most_recent_mcas_ela_performance, :string
    add_column :students, :most_recent_mcas_math_scaled, :integer
    add_column :students, :most_recent_mcas_ela_scaled, :integer
    add_column :students, :most_recent_star_reading_percentile, :integer
    add_column :students, :most_recent_star_math_percentile, :integer
  end
end
