class AddDemographicsColumnsToStudent < ActiveRecord::Migration
  def change
    add_column :students, :program_assigned, :string
    add_column :students, :sped_placement, :string
    add_column :students, :disability, :string
    add_column :students, :sped_level_of_need, :string
    add_column :students, :plan_504, :string
  end
end
