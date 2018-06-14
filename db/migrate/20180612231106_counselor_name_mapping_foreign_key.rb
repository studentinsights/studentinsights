class CounselorNameMappingForeignKey < ActiveRecord::Migration[5.1]
  def change
    add_foreign_key "counselor_name_mappings", "educators", name: "counselor_name_mappings_educator_id_fk"
  end
end
