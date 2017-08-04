class CreateSections < ActiveRecord::Migration[5.0]
  def change
    create_table :sections do |t|
      t.string    :section_number
      t.string    :term_local_id
      t.string    :schedule
      t.string    :room_number
      t.datetime  :created_at
      t.datetime  :updated_at
      t.integer   :course_id
    end
  end
end