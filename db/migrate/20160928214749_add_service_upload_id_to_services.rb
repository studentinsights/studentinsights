# typed: true
class AddServiceUploadIdToServices < ActiveRecord::Migration[4.2]
  def change
    add_column :services, :service_upload_id, :integer
  end
end
