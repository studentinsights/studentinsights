# typed: true
class AddStudentRiskLevelCacheToStudentsTable < ActiveRecord::Migration[4.2]
  def change
    add_column :students, :risk_level, :integer
  end
end
