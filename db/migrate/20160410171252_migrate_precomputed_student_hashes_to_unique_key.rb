# typed: true
class MigratePrecomputedStudentHashesToUniqueKey < ActiveRecord::Migration[4.2]
  # This removes the `precomputed_student_hashes_docs` table, where we've run into
  # issues with Rails not encoding the string type for the primary key into schema.rb,
  # and replaces it with a new table that keeps the regular Rails primary and adds
  # treats the string key as a plain field with an index and uniqueness constraint.
  def change
    drop_table :precomputed_student_hashes_docs
    create_table :precomputed_query_docs do |t|
      t.string :key
      t.text :json
      t.timestamps
    end
    add_index :precomputed_query_docs, :key, :unique => true
  end
end
