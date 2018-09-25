class EducatorHomeroomKey < ActiveRecord::Migration[5.2]
  def change
    add_reference :educators, :homeroom
    add_foreign_key :educators, :homerooms
  end
end
