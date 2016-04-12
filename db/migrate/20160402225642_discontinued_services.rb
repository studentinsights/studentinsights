class DiscontinuedServices < ActiveRecord::Migration
  def change
    create_table :discontinued_services do |t|
      t.integer :service_id
      t.integer :recorded_by_educator_id
      t.datetime :recorded_at

      t.timestamps
    end
  end
end
