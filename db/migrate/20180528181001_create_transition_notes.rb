class CreateTransitionNotes < ActiveRecord::Migration[5.1]
  def change
    create_table :transition_notes do |t|

      t.timestamps
      t.belongs_to :educator, index: true, foreign_key: true
      t.belongs_to :student, index: true, foreign_key: true
      t.text "text"
      t.datetime "recorded_at"
      t.boolean "is_restricted", default: false
    end
  end
end
