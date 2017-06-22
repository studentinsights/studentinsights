class CreateSections < ActiveRecord::Migration[5.0]
  def change
    create_table :sections do |t|
      t.string    :local_id
      t.datetime  :created_at
      t.datetime  :updated_at
      t.integer   :school_id
      t.integer   :course_id
    end
  end
end
