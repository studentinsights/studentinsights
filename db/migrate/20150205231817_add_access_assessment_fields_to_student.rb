class AddAccessAssessmentFieldsToStudent < ActiveRecord::Migration
  def change
    add_column :students, :access_progress, :boolean
    add_column :students, :access_growth, :integer
    add_column :students, :access_performance, :integer
  end
end
