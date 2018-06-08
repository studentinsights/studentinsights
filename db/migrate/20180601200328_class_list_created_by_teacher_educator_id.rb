class ClassListCreatedByTeacherEducatorId < ActiveRecord::Migration[5.1]
  def change
    rename_column :class_lists, :created_by_educator_id, :created_by_teacher_educator_id
  end
end
