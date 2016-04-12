class IncreasePrecomputedStudentHashesDocKey < ActiveRecord::Migration
  def change
    change_column :precomputed_student_hashes_docs, :key, :text, :limit => nil
  end
end
