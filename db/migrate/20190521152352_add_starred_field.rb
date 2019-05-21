class AddStarredField < ActiveRecord::Migration[5.2]
  def change
    add_column :second_transition_notes, :starred, :boolean, default: false
  end
end
