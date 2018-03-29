class CreateIepDocuments < ActiveRecord::Migration[5.0]
  def change
    create_table :iep_documents do |t|
      t.datetime :file_date
      t.string :file_name
      t.references :student

      t.timestamps
    end
  end
end
