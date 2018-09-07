class AddLoginToEducatorsTable < ActiveRecord::Migration[5.2]
  def change
    add_column :educators, :login_name, :string
  end
end
