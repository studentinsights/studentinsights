class ChangeAttributeType < ActiveRecord::Migration
  def change
  	rename_column :schools, :type, :school_type
  end
end
