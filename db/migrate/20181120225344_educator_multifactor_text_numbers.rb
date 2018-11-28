class EducatorMultifactorTextNumbers < ActiveRecord::Migration[5.2]
  def change
    create_table :educator_multifactor_text_numbers do |t|
      t.integer :educator_id, null: false
      t.string :sms_number, null: false
      t.datetime :last_verification_at, null: true
      t.timestamps
    end
    add_foreign_key :educator_multifactor_text_numbers, :educators
    add_index :educator_multifactor_text_numbers, :educator_id, unique: true
    add_index :educator_multifactor_text_numbers, :sms_number, unique: true
  end
end
