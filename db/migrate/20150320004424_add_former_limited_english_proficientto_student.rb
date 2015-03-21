class AddFormerLimitedEnglishProficienttoStudent < ActiveRecord::Migration
  def change
  	add_column :students, :former_limited_english_proficient, :string
  end
end
