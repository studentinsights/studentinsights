class AddFieldsToStudents < ActiveRecord::Migration
  def change
    add_column :students, :ela_scaled, :integer
    add_column :students, :ela_performance, :string
    add_column :students, :ela_growth, :integer
    add_column :students, :math_scaled, :integer
    add_column :students, :math_performance, :string
    add_column :students, :math_growth, :integer
    add_column :students, :homeroom, :string
    add_column :students, :sped, :boolean
  end
end