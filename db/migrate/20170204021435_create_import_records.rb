# typed: true
class CreateImportRecords < ActiveRecord::Migration[4.2]
  def change
    create_table :import_records do |t|
      t.datetime :time_started
      t.datetime :time_ended

      t.timestamps null: false
    end
  end
end
