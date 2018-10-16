class AddHistoricalLevels < ActiveRecord::Migration[5.2]
  def change
    create_table :historical_levels_snapshot do |t|
      t.datetime :time_now
      t.json :student_ids
      t.json :students_with_levels_json
      t.timestamps
    end
  end
end
