class AddEducatorIdToIntervention < ActiveRecord::Migration
  def change
    add_column :interventions, :educator_id, :integer
  end
end
