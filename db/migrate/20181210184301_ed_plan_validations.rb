# typed: true
class EdPlanValidations < ActiveRecord::Migration[5.2]
  def change
    # ed plans
    remove_column :ed_plans, :sep_grade_level, :text # no data in export
    change_column :ed_plans, :sep_effective_date, :date, null: false # date of implementation, required
    change_column :ed_plans, :sep_fieldd_006, :text, null: false # specific disability, required
    change_column :ed_plans, :sep_fieldd_007, :text, null: false # persons responsible, required

    # ed plan accommodations
    remove_column :ed_plan_accommodations, :iac_content_area, :text
    remove_column :ed_plan_accommodations, :iac_category, :text
    remove_column :ed_plan_accommodations, :iac_type, :text
    remove_column :ed_plan_accommodations, :iac_name, :text
  end
end
