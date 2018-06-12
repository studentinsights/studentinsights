class AddClassListSnapshotForeignKey < ActiveRecord::Migration[5.1]
  def change
    add_foreign_key :class_list_snapshots, :class_lists
  end
end
