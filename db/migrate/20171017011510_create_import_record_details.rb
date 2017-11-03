class CreateImportRecordDetails < ActiveRecord::Migration[5.1]
  def change
    create_table :import_record_details do |t|
      t.integer :import_record_id
      t.string :importer
      t.datetime :time_started
      t.datetime :time_ended
      t.string :status
      t.string :error_message
      t.integer :rows_processed
      t.integer :rows_excluded
      t.integer :rows_created
      t.integer :rows_updated
      t.integer :rows_deleted
      t.integer :rows_rejected
      t.timestamps
    end
  end
end

