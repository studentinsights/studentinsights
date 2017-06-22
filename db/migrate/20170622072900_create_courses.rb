class CreateCourses < ActiveRecord::Migration[5.0]
  def change
    create_table :courses do |t|
      t.string    :local_id
      t.datetime  :created_at
      t.datetime  :updated_at
      t.integer   :school_id
      t.string    :name
    end
  end
end
