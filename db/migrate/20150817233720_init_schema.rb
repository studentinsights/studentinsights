# typed: true
class InitSchema < ActiveRecord::Migration[4.2]
  def up
    
    # These are extensions that must be enabled in order to support this database
    enable_extension "plpgsql"
    
    create_table "assessment_families", force: true do |t|
      t.string   "name"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    
    create_table "assessment_subjects", force: true do |t|
      t.string   "name"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    
    create_table "assessments", force: true do |t|
      t.string   "name"
      t.string   "family"
      t.string   "subject"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    
    create_table "attendance_events", force: true do |t|
      t.integer  "student_id"
      t.datetime "created_at"
      t.datetime "updated_at"
      t.boolean  "absence"
      t.boolean  "tardy"
      t.integer  "school_year_id"
      t.datetime "event_date"
    end
    
    add_index "attendance_events", ["school_year_id"], name: "index_attendance_events_on_school_year_id", using: :btree
    add_index "attendance_events", ["student_id"], name: "index_attendance_events_on_student_id", using: :btree
    
    create_table "discipline_incidents", force: true do |t|
      t.integer  "student_id"
      t.string   "incident_code"
      t.datetime "created_at"
      t.datetime "updated_at"
      t.string   "incident_location"
      t.text     "incident_description"
      t.datetime "event_date"
      t.boolean  "has_exact_time"
      t.integer  "school_year_id"
    end
    
    add_index "discipline_incidents", ["school_year_id"], name: "index_discipline_incidents_on_school_year_id", using: :btree
    add_index "discipline_incidents", ["student_id"], name: "index_discipline_incidents_on_student_id", using: :btree
    
    create_table "educators", force: true do |t|
      t.string   "email",                  default: "", null: false
      t.string   "encrypted_password",     default: "", null: false
      t.string   "reset_password_token"
      t.datetime "reset_password_sent_at"
      t.datetime "remember_created_at"
      t.integer  "sign_in_count",          default: 0,  null: false
      t.datetime "current_sign_in_at"
      t.datetime "last_sign_in_at"
      t.inet     "current_sign_in_ip"
      t.inet     "last_sign_in_ip"
      t.datetime "created_at"
      t.datetime "updated_at"
      t.boolean  "admin"
      t.string   "phone"
    end
    
    add_index "educators", ["email"], name: "index_educators_on_email", unique: true, using: :btree
    add_index "educators", ["reset_password_token"], name: "index_educators_on_reset_password_token", unique: true, using: :btree
    
    create_table "friendly_id_slugs", force: true do |t|
      t.string   "slug",                      null: false
      t.integer  "sluggable_id",              null: false
      t.string   "sluggable_type", limit: 50
      t.string   "scope"
      t.datetime "created_at"
    end
    
    add_index "friendly_id_slugs", ["slug", "sluggable_type", "scope"], name: "index_friendly_id_slugs_on_slug_and_sluggable_type_and_scope", unique: true, using: :btree
    add_index "friendly_id_slugs", ["slug", "sluggable_type"], name: "index_friendly_id_slugs_on_slug_and_sluggable_type", using: :btree
    add_index "friendly_id_slugs", ["sluggable_id"], name: "index_friendly_id_slugs_on_sluggable_id", using: :btree
    add_index "friendly_id_slugs", ["sluggable_type"], name: "index_friendly_id_slugs_on_sluggable_type", using: :btree
    
    create_table "homerooms", force: true do |t|
      t.string   "name"
      t.datetime "created_at"
      t.datetime "updated_at"
      t.integer  "students_count"
      t.integer  "educator_id"
      t.string   "slug"
    end
    
    add_index "homerooms", ["educator_id"], name: "index_homerooms_on_educator_id", using: :btree
    
    create_table "intervention_types", force: true do |t|
      t.string   "name"
      t.datetime "created_at"
      t.datetime "updated_at"
    end
    
    create_table "interventions", force: true do |t|
      t.integer  "student_id"
      t.integer  "intervention_type_id"
      t.text     "comment"
      t.date     "start_date"
      t.date     "end_date"
      t.datetime "created_at"
      t.datetime "updated_at"
      t.integer  "educator_id"
    end
    
    create_table "school_years", force: true do |t|
      t.string   "name"
      t.datetime "created_at"
      t.datetime "updated_at"
      t.date     "start"
    end
    
    create_table "schools", force: true do |t|
      t.integer  "state_id"
      t.string   "school_type"
      t.string   "name"
      t.datetime "created_at"
      t.datetime "updated_at"
      t.string   "local_id"
    end
    
    add_index "schools", ["local_id"], name: "index_schools_on_local_id", using: :btree
    add_index "schools", ["state_id"], name: "index_schools_on_state_id", using: :btree
    
    create_table "student_assessments", force: true do |t|
      t.integer  "scale_score"
      t.integer  "growth_percentile"
      t.string   "performance_level"
      t.datetime "date_taken"
      t.integer  "student_id"
      t.datetime "created_at"
      t.datetime "updated_at"
      t.integer  "percentile_rank"
      t.decimal  "instructional_reading_level"
      t.integer  "school_year_id"
      t.integer  "assessment_id"
    end
    
    add_index "student_assessments", ["school_year_id"], name: "index_student_assessments_on_school_year_id", using: :btree
    add_index "student_assessments", ["student_id"], name: "index_student_assessments_on_student_id", using: :btree
    
    create_table "students", force: true do |t|
      t.string   "grade"
      t.boolean  "hispanic_latino"
      t.string   "race"
      t.string   "free_reduced_lunch"
      t.datetime "created_at"
      t.datetime "updated_at"
      t.boolean  "sped"
      t.integer  "homeroom_id"
      t.string   "first_name"
      t.string   "last_name"
      t.string   "state_id"
      t.string   "home_language"
      t.string   "address"
      t.integer  "school_id"
      t.string   "student_address"
      t.datetime "registration_date"
      t.string   "local_id"
      t.string   "program_assigned"
      t.string   "sped_placement"
      t.string   "disability"
      t.string   "sped_level_of_need"
      t.string   "plan_504"
      t.string   "limited_english_proficiency"
    end
    
    add_index "students", ["homeroom_id"], name: "index_students_on_homeroom_id", using: :btree
    add_index "students", ["local_id"], name: "index_students_on_local_id", using: :btree
    add_index "students", ["school_id"], name: "index_students_on_school_id", using: :btree
    add_index "students", ["state_id"], name: "index_students_on_state_id", using: :btree
    
  end

  def down
    raise "Can not revert initial migration"
  end
end
