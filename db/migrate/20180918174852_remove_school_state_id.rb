class RemoveSchoolStateId < ActiveRecord::Migration[5.2]
  def change
    remove_column :schools, :state_id
  end
end
