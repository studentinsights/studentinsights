class CreateDistrictConfigLog < ActiveRecord::Migration[5.2]
  def change
    create_table :district_config_logs do |t|
      t.string :key, null: false
      t.json :json, null: false
      t.datetime :created_at, null: false
    end
    add_index :district_configs, :key
    add_index :district_configs, :created_at
  end
end
