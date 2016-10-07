class AddFileNameToServiceUpload < ActiveRecord::Migration
  def change
    add_column :service_uploads, :file_name, :string
  end
end
