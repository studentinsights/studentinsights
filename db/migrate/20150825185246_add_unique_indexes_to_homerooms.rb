class AddUniqueIndexesToHomerooms < ActiveRecord::Migration
  def change
    add_index :homerooms, :name, unique: true
    add_index :homerooms, :slug, unique: true
  end
end
