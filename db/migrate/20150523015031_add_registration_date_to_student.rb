class AddRegistrationDateToStudent < ActiveRecord::Migration
  def change
    add_column :students, :registration_date, :datetime
  end
end
