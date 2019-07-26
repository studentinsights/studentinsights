# typed: true
class EdPlanAccomodations < ActiveRecord::Migration[5.2]
  def change
    create_table :ed_plan_accommodations do |t|
      t.integer :ed_plan_id, null: false
      t.text :iac_oid, null: false, unique: true
      t.text :iac_sep_oid, null: false
      t.text :iac_content_area
      t.text :iac_category
      t.text :iac_type
      t.text :iac_description
      t.text :iac_field
      t.text :iac_name
      t.datetime :iac_last_modified
      t.timestamps
    end
    add_index :ed_plan_accommodations, :iac_oid, unique: true
    add_foreign_key :ed_plan_accommodations, :ed_plans
  end
end
