class RemoveOtpFromEducator < ActiveRecord::Migration
  def change
    remove_column :educators, :encrypted_otp_secret, :string
    remove_column :educators, :encrypted_otp_secret_iv, :string
    remove_column :educators, :encrypted_otp_secret_salt, :string
    remove_column :educators, :otp_required_for_login, :boolean, default: false
  end
end
