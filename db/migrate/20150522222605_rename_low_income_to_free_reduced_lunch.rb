class RenameLowIncomeToFreeReducedLunch < ActiveRecord::Migration
  def change
    rename_column :students, :low_income, :free_reduced_lunch
  end
end
