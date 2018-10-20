class LocalIdUniq < ActiveRecord::Migration[5.2]
  def change
    remove_index :students, :local_id
    add_index :students, :local_id, unique: true

    add_index :educators, :email, unique: true
    add_index :educators, :login_name, unique: true
  end
end
