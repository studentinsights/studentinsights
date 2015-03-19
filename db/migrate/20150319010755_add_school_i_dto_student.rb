class AddSchoolIDtoStudent < ActiveRecord::Migration
  def change
  	add_column :students, :school_id, :integer
  end
end
