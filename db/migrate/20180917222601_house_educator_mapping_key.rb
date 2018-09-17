class HouseEducatorMappingKey < ActiveRecord::Migration[5.2]
  def change
    add_foreign_key "house_educator_mappings", "educators", name: "house_educator_mappings_educator_id_fk"
  end
end
