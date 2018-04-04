class AddTaskOptionsToImporterRecords < ActiveRecord::Migration[5.1]
  def change
    add_column :import_records, :task_options_json, :text
  end
end
