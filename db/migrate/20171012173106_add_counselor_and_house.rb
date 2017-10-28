class AddCounselorAndHouse < ActiveRecord::Migration[5.1]
  def change
    add_column :students, :house, :text
    add_column :students, :counselor, :text
  end
end
