class RemovePasswordFieldFromEducator < ActiveRecord::Migration[5.1]
  def change
    remove_column :educators, :encrypted_password
    remove_column :educators, :reset_password_token
    remove_column :educators, :reset_password_sent_at
  end
end
