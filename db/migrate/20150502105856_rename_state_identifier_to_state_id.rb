class RenameStateIdentifierToStateId < ActiveRecord::Migration
  def change
    rename_column :students, :state_identifier, :state_id
  end
end
