class AddLogToImporterRecords < ActiveRecord::Migration[5.1]
  def change
    add_column :import_records, :log, :text
  end
end
