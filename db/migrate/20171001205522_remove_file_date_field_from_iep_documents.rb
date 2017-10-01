class RemoveFileDateFieldFromIepDocuments < ActiveRecord::Migration[5.1]
  def change
    remove_column :iep_documents, :file_date
  end
end
