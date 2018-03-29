class RenameRecordedAtToDiscontinuedAt < ActiveRecord::Migration[5.1]
  def change
    rename_column :discontinued_services, :recorded_at, :discontinued_at
  end
end
