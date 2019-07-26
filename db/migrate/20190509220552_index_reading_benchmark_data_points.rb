# typed: true
class IndexReadingBenchmarkDataPoints < ActiveRecord::Migration[5.2]
  def change
    add_index :reading_benchmark_data_points, :student_id
    add_index :reading_benchmark_data_points, :benchmark_assessment_key
    add_index :reading_benchmark_data_points, [:benchmark_school_year, :benchmark_period_key], name: 'index_reading_benchmark_data_points_on_year_and_period_keys'
    add_index :reading_benchmark_data_points, :updated_at, order: :desc
  end
end
