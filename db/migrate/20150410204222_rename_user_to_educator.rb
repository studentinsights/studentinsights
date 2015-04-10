class RenameUserToEducator < ActiveRecord::Migration
  def change
    rename_table :users, :educators
  end
end
