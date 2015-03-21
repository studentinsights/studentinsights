class RemoveLimitedEnglishFromStudents < ActiveRecord::Migration
  def change
  	remove_column :students, :limited_english
  end
end
