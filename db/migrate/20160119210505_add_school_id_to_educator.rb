class AddSchoolIdToEducator < ActiveRecord::Migration
  def change
    add_column :educators, :school_id, :integer
  end
end
