class RemoveUniquenessContraintOnEducatorEmail < ActiveRecord::Migration
  def change
    remove_index :educators, name: 'index_educators_on_email'
  end
end
