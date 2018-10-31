class RelaxUniqunessOnPrecomputed < ActiveRecord::Migration[5.2]
  def change
    remove_index :precomputed_query_docs, :key
    add_index :precomputed_query_docs, :key, unique: false
  end
end
