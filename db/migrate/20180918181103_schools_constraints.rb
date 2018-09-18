class SchoolsConstraints < ActiveRecord::Migration[5.2]
  def change
    # make these all non-nullable
    change_column :schools, :school_type, :string, null: false
    change_column :schools, :name, :string, null: false
    change_column :schools, :local_id, :string, null: false
    change_column :schools, :slug, :string, null: false
    change_column :schools, :created_at, :datetime, null: false
    change_column :schools, :updated_at, :datetime, null: false
  end
end
