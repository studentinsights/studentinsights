class MultifactorAddRotpSecrets < ActiveRecord::Migration[5.2]
  def change
    add_column :educator_multifactor_text_numbers, :rotp_secret, :string, null: false
    add_index :educator_multifactor_text_numbers, :rotp_secret, unique: true
  end
end
