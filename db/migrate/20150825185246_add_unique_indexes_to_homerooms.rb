# typed: true
class AddUniqueIndexesToHomerooms < ActiveRecord::Migration[4.2]
  def change
    add_index :homerooms, :name, unique: true
    add_index :homerooms, :slug, unique: true
  end
end
