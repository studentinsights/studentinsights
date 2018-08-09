class CreateDibelsResults < ActiveRecord::Migration[5.2]
  def change
    create_table :dibels_results do |t|
      t.string :benchmark, null: false
      t.references :student, foreign_key: true, null: false
      t.datetime :date_taken, null: false
      t.timestamps
    end
  end
end
