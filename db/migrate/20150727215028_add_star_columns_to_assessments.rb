class AddStarColumnsToAssessments < ActiveRecord::Migration
  def change
    add_column :assessments, :percentile_rank, :integer
    add_column :assessments, :instructional_reading_level, :decimal
  end
end
