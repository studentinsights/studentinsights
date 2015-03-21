class CreateStandards < ActiveRecord::Migration
  def change
    create_table :standards do |t|
      t.string :short_code
      t.string :statement
      t.string :uri
      t.string :type
      t.text :grades

      t.timestamps
    end
  end
end
