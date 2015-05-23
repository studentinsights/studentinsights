# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150523005511) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "attendance_events", force: true do |t|
    t.integer  "student_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "absence"
    t.boolean  "tardy"
    t.integer  "school_year_id"
    t.datetime "event_date"
  end

  create_table "discipline_incidents", force: true do |t|
    t.integer  "student_id"
    t.string   "incident_code"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "incident_location"
    t.string   "incident_description"
    t.datetime "incident_date"
    t.boolean  "has_exact_time"
  end

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

  create_table "mcas_results", force: true do |t|
    t.integer  "ela_scaled"
    t.string   "ela_performance"
    t.integer  "ela_growth"
    t.integer  "math_scaled"
    t.string   "math_performance"
    t.integer  "math_growth"
    t.integer  "assessment_id"
    t.integer  "student_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.date     "date_taken"
  end

  create_table "school_years", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "schools", force: true do |t|
    t.integer  "state_id"
    t.string   "school_type"
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "local_id"
  end

  create_table "star_results", force: true do |t|
    t.integer  "math_percentile_rank"
    t.integer  "reading_percentile_rank"
    t.decimal  "instructional_reading_level"
    t.integer  "assessment_id"
    t.integer  "student_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.date     "date_taken"
  end

  create_table "students", force: true do |t|
    t.string   "grade"
    t.boolean  "hispanic_latino"
    t.string   "race"
    t.boolean  "free_reduced_lunch"
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
    t.boolean  "limited_english_proficient"
    t.boolean  "former_limited_english_proficient"
    t.string   "student_address"
  end

end
