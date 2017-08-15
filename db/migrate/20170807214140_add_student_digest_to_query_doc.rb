class AddStudentDigestToQueryDoc < ActiveRecord::Migration[5.0]
  def change
    add_column :precomputed_query_docs, :authorized_students_digest, :string
  end
end
