# typed: true
class AddSlugToSchool < ActiveRecord::Migration[4.2]
  def change
    add_column :schools, :slug, :string, unique: true
  end
end
