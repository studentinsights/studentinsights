# typed: true
class PrecomputedStudentHashesDocs < ActiveRecord::Migration[4.2]
  def change
    create_table :precomputed_student_hashes_docs, id: false do |t|
      t.string :key, primary_key: true
      t.text :json
      t.timestamps
    end
  end
end
