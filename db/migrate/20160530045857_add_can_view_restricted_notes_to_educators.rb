# typed: true
class AddCanViewRestrictedNotesToEducators < ActiveRecord::Migration[4.2]
  def change
    add_column :educators, :can_view_restricted_notes, :boolean
  end
end
