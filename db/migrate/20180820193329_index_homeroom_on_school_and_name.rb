class IndexHomeroomOnSchoolAndName < ActiveRecord::Migration[5.2]
  def change
    add_index(:homerooms, [:school_id, :name], unique: true)
  end
end
