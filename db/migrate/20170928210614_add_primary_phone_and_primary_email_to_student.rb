class AddPrimaryPhoneAndPrimaryEmailToStudent < ActiveRecord::Migration[5.1]
  def change
    add_column :students, :primary_phone, :string
    add_column :students, :primary_email, :string
  end
end
