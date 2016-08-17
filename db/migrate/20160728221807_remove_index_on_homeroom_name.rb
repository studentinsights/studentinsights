class RemoveIndexOnHomeroomName < ActiveRecord::Migration
  def change
    remove_index("homerooms", name: "index_homerooms_on_name")
  end
end
