class AddDiscontinuedAtToServices < ActiveRecord::Migration[5.1]
  def change
    add_column :services, :discontinued_at, :datetime
  end
end
