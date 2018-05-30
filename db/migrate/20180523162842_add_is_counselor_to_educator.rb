class AddIsCounselorToEducator < ActiveRecord::Migration[5.1]
  def change
    add_column :educators, :is_counselor, :boolean, default: false
  end
end
