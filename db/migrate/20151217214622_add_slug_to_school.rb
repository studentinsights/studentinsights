class AddSlugToSchool < ActiveRecord::Migration
  def change
    add_column :schools, :slug, :string, unique: true
  end
end
