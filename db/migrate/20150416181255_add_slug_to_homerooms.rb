class AddSlugToHomerooms < ActiveRecord::Migration
  def change
    add_column :homerooms, :slug, :string
  end
end
