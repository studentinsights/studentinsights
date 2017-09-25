class AddDateEndedToServices < ActiveRecord::Migration[5.1]
  def change
    add_column :services, :date_ended, :datetime
  end
end
