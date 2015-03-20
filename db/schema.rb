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

ActiveRecord::Schema.define(version: 20150320011837) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "rooms", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "students_count"
  end

  create_table "schools", force: true do |t|
    t.integer  "state_id"
    t.string   "school_type"
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "students", force: true do |t|
    t.string   "grade"
    t.boolean  "hispanic_latino"
    t.string   "race"
    t.boolean  "low_income"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "ela_scaled"
    t.string   "ela_performance"
    t.integer  "ela_growth"
    t.integer  "math_scaled"
    t.string   "math_performance"
    t.integer  "math_growth"
    t.boolean  "sped"
    t.integer  "room_id"
    t.boolean  "access_progress"
    t.integer  "access_growth"
    t.integer  "access_performance"
    t.string   "first_name"
    t.string   "last_name"
    t.string   "state_identifier"
    t.string   "home_language"
    t.integer  "school_id"
    t.boolean  "limited_english_proficient"
    t.boolean  "former_limited_english_proficient"
  end

  create_table "users", force: true do |t|
    t.string   "email",                     default: "",   null: false
    t.string   "encrypted_password",        default: "",   null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",             default: 0,    null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "admin"
    t.string   "phone"
    t.string   "encrypted_otp_secret"
    t.string   "encrypted_otp_secret_iv"
    t.string   "encrypted_otp_secret_salt"
    t.boolean  "otp_required_for_login",    default: true
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

end
