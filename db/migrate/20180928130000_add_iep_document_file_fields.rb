class AddIepDocumentFileFields < ActiveRecord::Migration[5.2]
  def change
    add_column :iep_documents, :file_digest, :string
    add_column :iep_documents, :file_size, :integer
    add_column :iep_documents, :s3_filename, :string
  end
end
