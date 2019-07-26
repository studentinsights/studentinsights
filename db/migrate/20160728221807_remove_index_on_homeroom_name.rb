# typed: true
class RemoveIndexOnHomeroomName < ActiveRecord::Migration[4.2]
  def change
    remove_index("homerooms", name: "index_homerooms_on_name")
  end
end
