class AddReadingBenchmarkDataPoints < ActiveRecord::Migration[5.2]
  def change
    create_table :reading_benchmark_data_points do |t|
      t.integer :student_id, null: false
      # school year, not calendar year
      # eg spring for school year 2018 occurs in May 2019
      t.integer :benchmark_school_year, null: false
      t.text :benchmark_period_key, null: false
      t.text :benchmark_assessment_key, null: false
      t.json :json, null: false
      t.integer :educator_id, null: false
      t.timestamps
    end
    add_foreign_key :reading_benchmark_data_points, :students
    add_foreign_key :reading_benchmark_data_points, :educators
  end
end
