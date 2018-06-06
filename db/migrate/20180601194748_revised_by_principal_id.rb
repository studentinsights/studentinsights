class RevisedByPrincipalId < ActiveRecord::Migration[5.1]
  def change
    add_column :class_lists, :revised_by_principal_educator_id, :integer
    add_foreign_key "class_lists", "educators", {
      column: 'revised_by_principal_educator_id',
      name: 'class_lists_revised_by_principal_educator_id_fk'
    }
  end
end
