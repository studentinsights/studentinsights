# typed: true
class RemoveUniquenessContraintOnEducatorEmail < ActiveRecord::Migration[4.2]
  def change
    remove_index :educators, name: 'index_educators_on_email'
  end
end
