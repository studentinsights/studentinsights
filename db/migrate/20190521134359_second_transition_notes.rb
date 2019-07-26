# typed: true
class SecondTransitionNotes < ActiveRecord::Migration[5.2]
  def change
    create_table :second_transition_notes do |t|
      t.timestamps
      t.belongs_to :educator, index: true, foreign_key: true
      t.belongs_to :student, index: true, foreign_key: true
      t.text "form_key", null: false
      t.json "form_json", null: false
      t.text "restricted_text"
    end
  end
end
