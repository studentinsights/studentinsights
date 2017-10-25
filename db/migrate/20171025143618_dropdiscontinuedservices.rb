class Dropdiscontinuedservices < ActiveRecord::Migration[5.1]
  def change
    drop_table :discontinued_services
  end
end
