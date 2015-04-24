class DropStandardsTable < ActiveRecord::Migration
  def change
    drop_table :standards
  end
end
