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

ActiveRecord::Schema.define(version: 20150116041031) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "rooms", force: true do |t|
    t.string   "name"
    t.string   "students_count"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "students", force: true do |t|
    t.integer  "new_id"
    t.string   "grade"
    t.boolean  "hispanic_latino"
    t.string   "race"
    t.string   "limited_english"
    t.boolean  "low_income"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "ela_scaled"
    t.string   "ela_performance"
    t.integer  "ela_growth"
    t.integer  "math_scaled"
    t.string   "math_performance"
    t.integer  "math_growth"
    t.string   "homeroom"
    t.boolean  "sped"
    t.integer  "room_id"
  end

end
