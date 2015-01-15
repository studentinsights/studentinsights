class ChangeLimitedEnglishToString < ActiveRecord::Migration
  def change
    change_column :students, :limited_english, :string
  end
end
