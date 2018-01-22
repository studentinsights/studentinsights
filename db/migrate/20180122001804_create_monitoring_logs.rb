class CreateMonitoringLogs < ActiveRecord::Migration[5.1]
  def change
    create_table :monitoring_logs do |t|
      t.string :name
      t.string :key
      t.jsonb :json

      t.datetime :created_at, null: false
    end
  end
end
