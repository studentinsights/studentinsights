# typed: true
class DropRiskLevelAndOtherOldFieldsFromStudent < ActiveRecord::Migration[4.2]
  def change
    remove_column :students, :risk_level
    remove_column :students, :sped
    remove_column :students, :address
  end
end
