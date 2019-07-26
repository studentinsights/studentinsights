# typed: true
class IncreasePrecomputedStudentHashesDocKey < ActiveRecord::Migration[4.2]
  def change
    change_column :precomputed_student_hashes_docs, :key, :text, :limit => nil
  end
end
