class UserOtpRequiredDefaultsToTrue < ActiveRecord::Migration
  def change
    change_column :users, :otp_required_for_login, :boolean, default: true
  end
end
