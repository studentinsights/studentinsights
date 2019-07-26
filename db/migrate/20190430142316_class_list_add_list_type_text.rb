# typed: true
class ClassListAddListTypeText < ActiveRecord::Migration[5.2]
  def change
    add_column :class_lists, :list_type_text, :string, :default => '(default)'
  end
end
