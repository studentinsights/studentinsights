class CreateServiceUploads < ActiveRecord::Migration
  def change
    create_table :service_uploads do |t|
      t.integer :uploaded_by_educator_id

      t.timestamps null: false
    end
  end
end
