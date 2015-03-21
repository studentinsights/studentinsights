class UpdateStandardModel < ActiveRecord::Migration
  def change
    change_column :standards, :statement, :text
    rename_column :standards, :type, :subject
  end
end
