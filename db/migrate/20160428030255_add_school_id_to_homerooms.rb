class AddSchoolIdToHomerooms < ActiveRecord::Migration
  def change
    add_column :homerooms, :school_id, :integer
  end
end
