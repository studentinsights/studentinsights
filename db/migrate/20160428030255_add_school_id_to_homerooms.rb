# typed: true
class AddSchoolIdToHomerooms < ActiveRecord::Migration[4.2]
  def change
    add_column :homerooms, :school_id, :integer
  end
end
