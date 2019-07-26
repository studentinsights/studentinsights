# typed: true
class AddReadingGroupingSnapshot < ActiveRecord::Migration[5.2]
  def change
    create_table :reading_grouping_snapshots do |t|
      t.text :grouping_workspace_id, null: false
      t.integer :school_id, null: false
      t.text :grade, null: false
      t.integer :benchmark_school_year, null: false
      t.text :benchmark_period_key, null: false
      t.json :snapshot_json, null: false
      t.integer :educator_id, null: false
      t.timestamps
    end
    add_foreign_key :reading_grouping_snapshots, :schools
    add_foreign_key :reading_grouping_snapshots, :educators
  end
end
