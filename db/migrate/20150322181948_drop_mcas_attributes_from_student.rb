class DropMcasAttributesFromStudent < ActiveRecord::Migration
  def change
    remove_column :students, :ela_scaled
    remove_column :students, :ela_performance
    remove_column :students, :ela_growth
    remove_column :students, :math_scaled
    remove_column :students, :math_performance
    remove_column :students, :math_growth
  end
end
