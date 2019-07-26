# typed: true
class IncreasePrecomputedQueryDocSize < ActiveRecord::Migration[4.2]
  def change
    change_column :precomputed_query_docs, :key, :text, :limit => nil
    change_column :precomputed_query_docs, :json, :text, :limit => nil
  end
end
