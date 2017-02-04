class CreateImportRecords < ActiveRecord::Migration
  def change
    create_table :import_records do |t|
      t.datetime :time_started
      t.datetime :time_ended

      t.timestamps null: false
    end
  end
end
