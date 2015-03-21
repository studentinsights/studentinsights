class ChangeLepAndFlepToBoolean < ActiveRecord::Migration
  def change
  	change_column :students, :limited_english_proficient, 'boolean USING CAST(limited_english_proficient AS boolean)'
  	change_column :students, :former_limited_english_proficient, 'boolean USING CAST(former_limited_english_proficient AS boolean)'
  end
end
