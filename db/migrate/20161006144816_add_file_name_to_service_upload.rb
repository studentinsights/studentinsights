# typed: true
class AddFileNameToServiceUpload < ActiveRecord::Migration[4.2]
  def change
    add_column :service_uploads, :file_name, :string
  end
end
