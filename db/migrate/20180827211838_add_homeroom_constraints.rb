class AddHomeroomConstraints < ActiveRecord::Migration[5.2]
  def change
    add_foreign_key "homerooms", "educators", name: "homerooms_for_educator_id_fk"
    add_foreign_key "homerooms", "schools", name: "homerooms_for_school_id_fk"

    change_column :homerooms, :school_id, :integer, null: false
    change_column :homerooms, :name, :string, null: false
    change_column :homerooms, :slug, :string, null: false
  end
end
