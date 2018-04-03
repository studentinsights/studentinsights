class EducatorLabelsForeignKey < ActiveRecord::Migration[5.1]
  def change
    add_foreign_key "educator_labels", "educators", name: "educator_labels_educator_id_fk"
  end
end
