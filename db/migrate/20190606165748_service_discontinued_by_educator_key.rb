class ServiceDiscontinuedByEducatorKey < ActiveRecord::Migration[5.2]
  def change
    add_foreign_key "services", "educators", column: "discontinued_by_educator_id", name: "services_discontinued_by_educator_id_fk"
  end
end
