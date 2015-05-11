class DropUselessTablesFromStudent < ActiveRecord::Migration
  def change
    remove_column :students, :access_progress
    remove_column :students, :access_growth
    remove_column :students, :access_performance
  end
end
