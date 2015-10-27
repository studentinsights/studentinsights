class AddEducatorIdToProgressNotes < ActiveRecord::Migration
  def change
    add_column :progress_notes, :educator_id, :integer
  end
end
