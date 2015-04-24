class CreateStarResults < ActiveRecord::Migration
  def change
    create_table :star_results do |t|
      t.integer :math_percentile_rank
      t.integer :reading_percentile_rank
      t.decimal :instructional_reading_level
      t.integer :assessment_id
      t.integer :student_id

      t.timestamps
    end
  end
end
