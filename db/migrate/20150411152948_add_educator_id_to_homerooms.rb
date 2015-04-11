class AddEducatorIdToHomerooms < ActiveRecord::Migration
  def change
    add_column :homerooms, :educator_id, :integer
  end
end
