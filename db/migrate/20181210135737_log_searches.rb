class LogSearches < ActiveRecord::Migration[5.2]
  def change
    create_table :logged_searches do |t|
      t.json :clamped_query_json, null: false
      t.integer :all_results_size, null: false
      t.date :search_date, null: false
    end
  end
end
