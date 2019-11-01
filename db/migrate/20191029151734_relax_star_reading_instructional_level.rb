class RelaxStarReadingInstructionalLevel < ActiveRecord::Migration[5.2]
  def change
    remove_column :star_reading_results, :instructional_reading_level
    remove_column :student_assessments, :instructional_reading_level
  end
end
