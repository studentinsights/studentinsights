class CreateSchools < ActiveRecord::Migration
  def change
    create_table :schools do |t|
      t.integer :state_id
      t.string :type
      t.string :name

      t.timestamps
    end
  end
end
