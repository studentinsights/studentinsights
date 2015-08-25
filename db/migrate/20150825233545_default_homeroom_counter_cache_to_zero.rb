class DefaultHomeroomCounterCacheToZero < ActiveRecord::Migration
  def change
    change_column :homerooms, :students_count, :integer, default: 0, null: false
  end
end
