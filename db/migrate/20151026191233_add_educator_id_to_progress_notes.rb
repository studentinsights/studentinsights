# typed: true
class AddEducatorIdToProgressNotes < ActiveRecord::Migration[4.2]
  def change
    add_column :progress_notes, :educator_id, :integer
  end
end
