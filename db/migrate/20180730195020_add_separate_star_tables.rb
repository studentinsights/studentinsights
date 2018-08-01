class AddSeparateStarTables < ActiveRecord::Migration[5.2]
  def change
    create_table :star_math_results do |t|
      t.integer :percentile_rank, null: false
      t.string :grade_equivalent, null: false
      t.integer :total_time, null: false
      t.references :student, foreign_key: true, null: false
      t.datetime :date_taken, null: false
      t.timestamps
    end

    create_table :star_reading_results do |t|
      t.integer :percentile_rank, null: false
      t.integer :total_time, null: false
      t.string :grade_equivalent, null: false
      t.decimal :instructional_reading_level, null: false
      t.references :student, foreign_key: true, null: false
      t.datetime :date_taken, null: false

      t.timestamps
    end
  end
end
