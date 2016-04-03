class PrecomputedStudentHashesDocs < ActiveRecord::Migration
  def change
    create_table :precomputed_student_hashes_docs, id: false do |t|
      t.string :key, primary_key: true
      t.json :json 
      t.timestamps
    end
  end
end
