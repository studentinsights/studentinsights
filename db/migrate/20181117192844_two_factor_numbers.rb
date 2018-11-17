class TwoFactorNumbers < ActiveRecord::Migration[5.2]
  def change
    create_table :educator_two_factor_numbers do |t|
      t.integer :educator_id, null: false
      t.string :two_factor_number, null: false
      t.timestamps
    end
    add_foreign_key :educator_two_factor_numbers, :educators
    add_index :educator_two_factor_numbers, :educator_id, unique: true
    add_index :educator_two_factor_numbers, :two_factor_number, unique: true
  end
end
