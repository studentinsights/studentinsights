class UpdateLimitedEnglishAttributes < ActiveRecord::Migration
  def change
    remove_column :students, :limited_english_proficient
    remove_column :students, :former_limited_english_proficient
    add_column :students, :limited_english_proficiency, :string
  end
end
