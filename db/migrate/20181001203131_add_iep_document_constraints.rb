class AddIepDocumentConstraints < ActiveRecord::Migration[5.2]
  def change
    change_column :iep_documents, :file_size, :integer, null: false
    change_column :iep_documents, :file_name, :string, null: false
    change_column :iep_documents, :file_digest, :string, null: false
    change_column :iep_documents, :s3_filename, :string, null: false
  end
end
