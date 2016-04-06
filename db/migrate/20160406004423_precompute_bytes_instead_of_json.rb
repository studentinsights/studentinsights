class PrecomputeBytesInsteadOfJson < ActiveRecord::Migration
  def change
    change_column :precomputed_student_hashes_docs, :json, :text
  end
end
