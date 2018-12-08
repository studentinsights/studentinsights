class EdPlan < ActiveRecord::Migration[5.2]
  def change
    create_table :ed_plans do |t|
      t.text :sep_oid, null: false, unique: true
      t.integer :student_id, null: false
      t.text :sep_grade_level # deprecated
      t.text :sep_status
      t.date :sep_effective_date
      t.date :sep_review_date
      t.date :sep_last_meeting_date
      t.date :sep_district_signed_date
      t.date :sep_parent_signed_date
      t.date :sep_end_date
      t.datetime :sep_last_modified
      t.text :sep_fieldd_001
      t.text :sep_fieldd_002
      t.text :sep_fieldd_003
      t.text :sep_fieldd_004
      t.text :sep_fieldd_005
      t.text :sep_fieldd_006
      t.text :sep_fieldd_007
      t.text :sep_fieldd_008
      t.text :sep_fieldd_009
      t.text :sep_fieldd_010
      t.text :sep_fieldd_011
      t.text :sep_fieldd_012
      t.text :sep_fieldd_013
      t.text :sep_fieldd_014
      t.timestamps
    end
    add_index :ed_plans, :sep_oid, unique: true
    add_foreign_key :ed_plans, :students
  end
end
