# typed: true
class CreateServiceUploads < ActiveRecord::Migration[4.2]
  def change
    create_table :service_uploads do |t|
      t.integer :uploaded_by_educator_id

      t.timestamps null: false
    end
  end
end
