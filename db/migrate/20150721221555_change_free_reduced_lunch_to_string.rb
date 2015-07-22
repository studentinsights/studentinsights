class ChangeFreeReducedLunchToString < ActiveRecord::Migration
  def change
    change_column :students, :free_reduced_lunch, :string
  end
end
