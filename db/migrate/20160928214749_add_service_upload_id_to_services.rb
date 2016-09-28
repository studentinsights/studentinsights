class AddServiceUploadIdToServices < ActiveRecord::Migration
  def change
    add_column :services, :service_upload_id, :integer
  end
end
