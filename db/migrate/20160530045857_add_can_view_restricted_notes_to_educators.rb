class AddCanViewRestrictedNotesToEducators < ActiveRecord::Migration
  def change
    add_column :educators, :can_view_restricted_notes, :boolean
  end
end
