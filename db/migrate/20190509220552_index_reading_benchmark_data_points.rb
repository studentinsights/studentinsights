class IndexReadingBenchmarkDataPoints < ActiveRecord::Migration[5.2]
  def change
    add_index :reading_benchmark_data_points, :student_id
  end
end
