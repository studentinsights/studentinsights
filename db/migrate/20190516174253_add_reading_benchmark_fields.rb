class AddReadingBenchmarkFields < ActiveRecord::Migration[5.2]
  def change
    add_column :reading_benchmark_data_points, :source, :text
    add_column :reading_benchmark_data_points, :benchmark_assessment_grade_level, :text
  end
end
