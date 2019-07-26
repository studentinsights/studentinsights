# typed: true
class DefaultHomeroomCounterCacheToZero < ActiveRecord::Migration[4.2]
  def change
    change_column :homerooms, :students_count, :integer, default: 0, null: false
  end
end
