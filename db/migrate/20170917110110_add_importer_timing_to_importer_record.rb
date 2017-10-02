class AddImporterTimingToImporterRecord < ActiveRecord::Migration[5.1]
  def change
    add_column :import_records, :importer_timing_json, :text
  end
end
