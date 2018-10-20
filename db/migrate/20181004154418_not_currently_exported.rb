class NotCurrentlyExported < ActiveRecord::Migration[5.2]
  def change
    add_column :students, :missing_from_last_export, :boolean, null: false, default: false
  end
end
