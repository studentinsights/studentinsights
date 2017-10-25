class AddDiscontinuedByEducatorIdToServices < ActiveRecord::Migration[5.1]
  def change
    add_column :services, :discontinued_by_educator_id, :integer
  end
end
