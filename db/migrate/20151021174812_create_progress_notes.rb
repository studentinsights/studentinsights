# typed: true
class CreateProgressNotes < ActiveRecord::Migration[4.2]
  def change
    create_table :progress_notes do |t|
      t.integer :intervention_id
      t.text :content

      t.timestamps
    end
  end
end
