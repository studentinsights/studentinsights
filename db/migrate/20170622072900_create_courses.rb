class CreateCourses < ActiveRecord::Migration[5.0]
  def change
    create_table :courses do |t|
      t.string    :course_number
      t.string    :course_description
      t.datetime  :created_at
      t.datetime  :updated_at
      t.integer   :school_id
    end
  end
end
