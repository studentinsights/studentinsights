class AddLimitedEnglishProficienttoStudent < ActiveRecord::Migration
  def change
  	add_column :students, :limited_english_proficient, :string
  end
end
