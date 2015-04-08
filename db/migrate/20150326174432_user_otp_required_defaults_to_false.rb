class UserOtpRequiredDefaultsToFalse < ActiveRecord::Migration
  def change
    change_column :users, :otp_required_for_login, :boolean, default: false
  end
end
