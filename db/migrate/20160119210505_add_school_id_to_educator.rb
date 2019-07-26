# typed: true
class AddSchoolIdToEducator < ActiveRecord::Migration[4.2]
  def change
    add_column :educators, :school_id, :integer
  end
end
