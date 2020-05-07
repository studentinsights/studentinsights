# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_05_06_203035) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "fuzzystrmatch"
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "absences", id: :serial, force: :cascade do |t|
    t.date "occurred_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "student_id", null: false
    t.boolean "dismissed"
    t.boolean "excused"
    t.string "reason"
    t.string "comment"
    t.index ["student_id", "occurred_at"], name: "index_absences_on_student_id_and_occurred_at", unique: true
    t.index ["student_id"], name: "index_absences_on_student_id"
  end

  create_table "assessments", id: :serial, force: :cascade do |t|
    t.string "name"
    t.string "family"
    t.string "subject"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "class_list_snapshots", force: :cascade do |t|
    t.integer "class_list_id"
    t.json "students_json"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "class_lists", force: :cascade do |t|
    t.string "workspace_id"
    t.integer "created_by_teacher_educator_id"
    t.integer "school_id"
    t.string "grade_level_next_year"
    t.json "json"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "submitted", default: false
    t.json "principal_revisions_json"
    t.integer "revised_by_principal_educator_id"
    t.string "list_type_text", default: "(default)"
    t.index ["workspace_id", "created_at"], name: "index_class_lists_on_workspace_id_and_created_at", order: { created_at: :desc }
  end

  create_table "counselor_meetings", force: :cascade do |t|
    t.integer "student_id", null: false
    t.integer "educator_id", null: false
    t.date "meeting_date", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["educator_id"], name: "index_counselor_meetings_on_educator_id"
    t.index ["student_id", "educator_id", "meeting_date"], name: "counselor_meetings_unique_index", unique: true
    t.index ["student_id"], name: "index_counselor_meetings_on_student_id"
  end

  create_table "counselor_name_mappings", force: :cascade do |t|
    t.text "counselor_field_text"
    t.integer "educator_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "courses", id: :serial, force: :cascade do |t|
    t.string "course_number"
    t.string "course_description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "school_id", null: false
    t.index ["course_number", "school_id"], name: "course_number_unique_within_school", unique: true
  end

  create_table "delayed_jobs", id: :serial, force: :cascade do |t|
    t.integer "priority", default: 0, null: false
    t.integer "attempts", default: 0, null: false
    t.text "handler", null: false
    t.text "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string "locked_by"
    t.string "queue"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["priority", "run_at"], name: "delayed_jobs_priority"
  end

  create_table "dibels_results", force: :cascade do |t|
    t.string "benchmark", null: false
    t.string "subtest_results"
    t.bigint "student_id", null: false
    t.datetime "date_taken", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["student_id"], name: "index_dibels_results_on_student_id"
  end

  create_table "discipline_incidents", id: :serial, force: :cascade do |t|
    t.string "incident_code"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "incident_location"
    t.text "incident_description"
    t.datetime "occurred_at", null: false
    t.boolean "has_exact_time"
    t.integer "student_id", null: false
    t.index ["student_id"], name: "index_discipline_incidents_on_student_id"
  end

  create_table "district_config_logs", force: :cascade do |t|
    t.string "key", null: false
    t.json "json", null: false
    t.datetime "created_at", null: false
    t.index ["created_at"], name: "index_district_config_logs_on_created_at"
    t.index ["key"], name: "index_district_config_logs_on_key"
  end

  create_table "ed_plan_accommodations", force: :cascade do |t|
    t.integer "ed_plan_id", null: false
    t.text "iac_oid", null: false
    t.text "iac_sep_oid", null: false
    t.text "iac_description"
    t.text "iac_field"
    t.datetime "iac_last_modified"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["iac_oid"], name: "index_ed_plan_accommodations_on_iac_oid", unique: true
  end

  create_table "ed_plans", force: :cascade do |t|
    t.text "sep_oid", null: false
    t.integer "student_id", null: false
    t.text "sep_status"
    t.date "sep_effective_date", null: false
    t.date "sep_review_date"
    t.date "sep_last_meeting_date"
    t.date "sep_district_signed_date"
    t.date "sep_parent_signed_date"
    t.date "sep_end_date"
    t.datetime "sep_last_modified"
    t.text "sep_fieldd_001"
    t.text "sep_fieldd_002"
    t.text "sep_fieldd_003"
    t.text "sep_fieldd_004"
    t.text "sep_fieldd_005"
    t.text "sep_fieldd_006", null: false
    t.text "sep_fieldd_007", null: false
    t.text "sep_fieldd_008"
    t.text "sep_fieldd_009"
    t.text "sep_fieldd_010"
    t.text "sep_fieldd_011"
    t.text "sep_fieldd_012"
    t.text "sep_fieldd_013"
    t.text "sep_fieldd_014"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["sep_oid"], name: "index_ed_plans_on_sep_oid", unique: true
  end

  create_table "educator_labels", force: :cascade do |t|
    t.integer "educator_id"
    t.text "label_key"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "educator_multifactor_configs", force: :cascade do |t|
    t.integer "educator_id", null: false
    t.string "sms_number"
    t.datetime "last_verification_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "rotp_secret", null: false
    t.boolean "via_email", default: false
    t.index ["educator_id"], name: "index_educator_multifactor_configs_on_educator_id", unique: true
    t.index ["rotp_secret"], name: "index_educator_multifactor_configs_on_rotp_secret", unique: true
    t.index ["sms_number"], name: "index_educator_multifactor_configs_on_sms_number", unique: true
  end

  create_table "educator_searchbars", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.integer "educator_id", null: false
    t.json "student_searchbar_json", default: "[]", null: false
    t.index ["educator_id"], name: "index_educator_searchbars_on_educator_id", unique: true
  end

  create_table "educator_section_assignments", force: :cascade do |t|
    t.integer "section_id", null: false
    t.integer "educator_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["educator_id"], name: "index_educator_section_assignments_on_educator_id"
    t.index ["section_id"], name: "index_educator_section_assignments_on_section_id"
  end

  create_table "educators", id: :serial, force: :cascade do |t|
    t.string "email", default: "", null: false
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean "admin", default: false
    t.string "phone"
    t.string "full_name"
    t.string "state_id"
    t.string "local_id"
    t.string "staff_type"
    t.integer "school_id"
    t.boolean "schoolwide_access", default: false, null: false
    t.string "grade_level_access", default: [], array: true
    t.boolean "restricted_to_sped_students", default: false, null: false
    t.boolean "restricted_to_english_language_learners", default: false, null: false
    t.boolean "can_view_restricted_notes", default: false, null: false
    t.boolean "districtwide_access", default: false, null: false
    t.boolean "can_set_districtwide_access", default: false, null: false
    t.text "login_name", null: false
    t.boolean "missing_from_last_export", default: false, null: false
    t.index ["email"], name: "index_educators_on_email", unique: true
    t.index ["grade_level_access"], name: "index_educators_on_grade_level_access", using: :gin
    t.index ["login_name"], name: "index_educators_on_login_name", unique: true
  end

  create_table "event_note_attachments", id: :serial, force: :cascade do |t|
    t.string "url", null: false
    t.integer "event_note_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "event_note_completed_drafts", force: :cascade do |t|
    t.string "draft_key", null: false
    t.integer "student_id", null: false
    t.integer "educator_id", null: false
    t.integer "event_note_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["student_id", "educator_id", "draft_key"], name: "event_note_completed_drafts_unique_index", unique: true
  end

  create_table "event_note_drafts", force: :cascade do |t|
    t.string "draft_key", null: false
    t.integer "student_id", null: false
    t.integer "educator_id", null: false
    t.integer "event_note_type_id"
    t.boolean "is_restricted", default: false, null: false
    t.text "text", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["student_id", "educator_id", "draft_key"], name: "event_note_drafts_unique_index", unique: true
  end

  create_table "event_note_revisions", id: :serial, force: :cascade do |t|
    t.integer "student_id", null: false
    t.integer "educator_id", null: false
    t.integer "event_note_type_id", null: false
    t.text "text", null: false
    t.integer "event_note_id", null: false
    t.integer "version", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "event_note_types", id: :serial, force: :cascade do |t|
    t.string "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "event_notes", id: :serial, force: :cascade do |t|
    t.integer "student_id", null: false
    t.integer "educator_id", null: false
    t.integer "event_note_type_id", null: false
    t.text "text", null: false
    t.datetime "recorded_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_restricted", default: false, null: false
    t.text "draft_key"
    t.index ["educator_id", "student_id", "draft_key"], name: "event_note_draft_keyindex"
    t.index ["is_restricted"], name: "index_event_notes_on_is_restricted"
    t.index ["recorded_at"], name: "index_event_notes_on_recorded_at"
    t.index ["student_id"], name: "index_event_notes_on_student_id"
  end

  create_table "f_and_p_assessments", force: :cascade do |t|
    t.integer "student_id", null: false
    t.date "benchmark_date", null: false
    t.string "instructional_level", null: false
    t.string "f_and_p_code"
    t.integer "uploaded_by_educator_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["student_id", "benchmark_date"], name: "index_f_and_p_assessments_on_student_id_and_benchmark_date"
    t.index ["student_id"], name: "index_f_and_p_assessments_on_student_id"
  end

  create_table "friendly_id_slugs", id: :serial, force: :cascade do |t|
    t.string "slug", null: false
    t.integer "sluggable_id", null: false
    t.string "sluggable_type", limit: 50
    t.string "scope"
    t.datetime "created_at"
    t.index ["slug", "sluggable_type", "scope"], name: "index_friendly_id_slugs_on_slug_and_sluggable_type_and_scope", unique: true
    t.index ["slug", "sluggable_type"], name: "index_friendly_id_slugs_on_slug_and_sluggable_type"
    t.index ["sluggable_id"], name: "index_friendly_id_slugs_on_sluggable_id"
    t.index ["sluggable_type"], name: "index_friendly_id_slugs_on_sluggable_type"
  end

  create_table "historical_grades", force: :cascade do |t|
    t.bigint "student_id"
    t.bigint "section_id"
    t.text "section_number"
    t.text "course_number"
    t.text "grade"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["section_id"], name: "index_historical_grades_on_section_id"
    t.index ["student_id"], name: "index_historical_grades_on_student_id"
  end

  create_table "historical_levels_snapshots", force: :cascade do |t|
    t.datetime "time_now"
    t.json "student_ids"
    t.json "students_with_levels_json"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "homerooms", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "educator_id"
    t.string "slug", null: false
    t.string "grade"
    t.integer "school_id", null: false
    t.index ["educator_id"], name: "index_homerooms_on_educator_id"
    t.index ["school_id", "name"], name: "index_homerooms_on_school_id_and_name", unique: true
    t.index ["slug"], name: "index_homerooms_on_slug", unique: true
  end

  create_table "homework_help_sessions", force: :cascade do |t|
    t.integer "student_id"
    t.datetime "form_timestamp"
    t.json "course_ids"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "recorded_by_educator_id", null: false
  end

  create_table "house_educator_mappings", force: :cascade do |t|
    t.text "house_field_text", null: false
    t.integer "educator_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "iep_documents", id: :serial, force: :cascade do |t|
    t.string "file_name", null: false
    t.integer "student_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "file_digest", null: false
    t.integer "file_size", null: false
    t.string "s3_filename", null: false
    t.index ["student_id"], name: "index_iep_documents_on_student_id"
  end

  create_table "import_records", id: :serial, force: :cascade do |t|
    t.datetime "time_started"
    t.datetime "time_ended"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "importer_timing_json"
    t.text "task_options_json"
    t.text "log", default: ""
  end

  create_table "imported_forms", force: :cascade do |t|
    t.integer "student_id", null: false
    t.datetime "form_timestamp", null: false
    t.text "form_key", null: false
    t.text "form_url", null: false
    t.json "form_json", null: false
    t.integer "educator_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["form_key"], name: "index_imported_forms_on_form_key"
    t.index ["student_id"], name: "index_imported_forms_on_student_id"
  end

  create_table "intervention_types", id: :serial, force: :cascade do |t|
    t.string "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "interventions", id: :serial, force: :cascade do |t|
    t.integer "student_id", null: false
    t.integer "intervention_type_id", null: false
    t.text "comment"
    t.date "start_date"
    t.date "end_date"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "educator_id", null: false
    t.integer "number_of_hours"
    t.text "goal"
    t.string "custom_intervention_name"
  end

  create_table "logged_searches", force: :cascade do |t|
    t.json "clamped_query_json", null: false
    t.integer "all_results_size", null: false
    t.date "search_date", null: false
  end

  create_table "login_activities", force: :cascade do |t|
    t.text "scope"
    t.text "strategy"
    t.string "identity"
    t.boolean "success"
    t.text "failure_reason"
    t.string "user_type"
    t.bigint "user_id"
    t.text "context"
    t.string "ip"
    t.text "user_agent"
    t.text "referrer"
    t.text "city"
    t.text "region"
    t.text "country"
    t.datetime "created_at"
    t.index ["identity"], name: "index_login_activities_on_identity"
    t.index ["ip"], name: "index_login_activities_on_ip"
    t.index ["user_type", "user_id"], name: "index_login_activities_on_user_type_and_user_id"
  end

  create_table "masquerading_logs", force: :cascade do |t|
    t.integer "educator_id"
    t.integer "masquerading_as_educator_id"
    t.text "action"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "password_checks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "json_encrypted"
  end

  create_table "precomputed_query_docs", id: :serial, force: :cascade do |t|
    t.text "key"
    t.text "json"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "authorized_students_digest"
    t.index ["key"], name: "index_precomputed_query_docs_on_key"
  end

  create_table "reading_benchmark_data_points", force: :cascade do |t|
    t.integer "student_id", null: false
    t.integer "benchmark_school_year", null: false
    t.text "benchmark_period_key", null: false
    t.text "benchmark_assessment_key", null: false
    t.json "json", null: false
    t.integer "educator_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["benchmark_assessment_key"], name: "index_reading_benchmark_data_points_on_benchmark_assessment_key"
    t.index ["benchmark_school_year", "benchmark_period_key"], name: "index_reading_benchmark_data_points_on_year_and_period_keys"
    t.index ["student_id"], name: "index_reading_benchmark_data_points_on_student_id"
    t.index ["updated_at"], name: "index_reading_benchmark_data_points_on_updated_at", order: :desc
  end

  create_table "reading_grouping_snapshots", force: :cascade do |t|
    t.text "grouping_workspace_id", null: false
    t.integer "school_id", null: false
    t.text "grade", null: false
    t.integer "benchmark_school_year", null: false
    t.text "benchmark_period_key", null: false
    t.json "snapshot_json", null: false
    t.integer "educator_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "schools", id: :serial, force: :cascade do |t|
    t.string "school_type", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "local_id", null: false
    t.string "slug", null: false
    t.index ["local_id"], name: "index_schools_on_local_id"
  end

  create_table "second_transition_notes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "educator_id"
    t.bigint "student_id"
    t.text "form_key", null: false
    t.json "form_json", null: false
    t.text "restricted_text"
    t.boolean "starred", default: false
    t.datetime "recorded_at", null: false
    t.index ["educator_id"], name: "index_second_transition_notes_on_educator_id"
    t.index ["student_id"], name: "index_second_transition_notes_on_student_id"
  end

  create_table "sections", id: :serial, force: :cascade do |t|
    t.string "section_number", null: false
    t.string "term_local_id", null: false
    t.string "schedule"
    t.string "room_number"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "course_id", null: false
    t.integer "district_school_year"
    t.index ["course_id", "district_school_year", "term_local_id", "section_number"], name: "sections_uniqueness_constraint", unique: true
  end

  create_table "service_types", id: :serial, force: :cascade do |t|
    t.string "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean "summer_program", default: false
    t.string "description"
    t.string "intensity"
    t.string "data_owner"
  end

  create_table "service_uploads", id: :serial, force: :cascade do |t|
    t.integer "uploaded_by_educator_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "file_name"
  end

  create_table "services", id: :serial, force: :cascade do |t|
    t.integer "student_id", null: false
    t.integer "recorded_by_educator_id", null: false
    t.integer "service_type_id", null: false
    t.datetime "recorded_at", null: false
    t.datetime "date_started", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "provided_by_educator_name"
    t.integer "service_upload_id"
    t.datetime "estimated_end_date"
    t.datetime "discontinued_at"
    t.integer "discontinued_by_educator_id"
  end

  create_table "star_math_results", force: :cascade do |t|
    t.integer "percentile_rank", null: false
    t.string "grade_equivalent", null: false
    t.integer "total_time", null: false
    t.bigint "student_id", null: false
    t.datetime "date_taken", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["student_id"], name: "index_star_math_results_on_student_id"
  end

  create_table "star_reading_results", force: :cascade do |t|
    t.integer "percentile_rank", null: false
    t.integer "total_time", null: false
    t.string "grade_equivalent", null: false
    t.bigint "student_id", null: false
    t.datetime "date_taken", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["student_id"], name: "index_star_reading_results_on_student_id"
  end

  create_table "student_assessments", id: :serial, force: :cascade do |t|
    t.integer "scale_score"
    t.integer "growth_percentile"
    t.string "performance_level"
    t.datetime "date_taken"
    t.integer "student_id", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "percentile_rank"
    t.integer "assessment_id", null: false
    t.string "grade_equivalent"
    t.index ["student_id"], name: "index_student_assessments_on_student_id"
  end

  create_table "student_photos", force: :cascade do |t|
    t.bigint "student_id"
    t.string "file_digest", null: false
    t.integer "file_size", null: false
    t.string "s3_filename", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["student_id"], name: "index_student_photos_on_student_id"
  end

  create_table "student_section_assignments", force: :cascade do |t|
    t.integer "section_id"
    t.integer "student_id"
    t.decimal "grade_numeric"
    t.string "grade_letter"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["section_id"], name: "index_student_section_assignments_on_section_id"
    t.index ["student_id"], name: "index_student_section_assignments_on_student_id"
  end

  create_table "student_voice_completed_surveys", force: :cascade do |t|
    t.integer "student_voice_survey_upload_id", null: false
    t.integer "student_id", null: false
    t.datetime "form_timestamp", null: false
    t.text "first_name", null: false
    t.text "student_lasid", null: false
    t.text "proud", null: false
    t.text "best_qualities", null: false
    t.text "activities_and_interests", null: false
    t.text "nervous_or_stressed", null: false
    t.text "learn_best", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["form_timestamp"], name: "index_student_voice_completed_surveys_on_form_timestamp"
    t.index ["student_id"], name: "index_student_voice_completed_surveys_on_student_id"
  end

  create_table "student_voice_survey_uploads", force: :cascade do |t|
    t.text "file_name", null: false
    t.integer "file_size", default: 0, null: false
    t.text "file_digest", null: false
    t.integer "uploaded_by_educator_id", null: false
    t.boolean "completed", default: false, null: false
    t.json "stats", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "students", id: :serial, force: :cascade do |t|
    t.string "grade"
    t.boolean "hispanic_latino"
    t.string "race"
    t.string "free_reduced_lunch"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "homeroom_id"
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "state_id"
    t.string "home_language"
    t.integer "school_id", null: false
    t.string "student_address"
    t.datetime "registration_date"
    t.string "local_id", null: false
    t.string "program_assigned"
    t.string "sped_placement"
    t.string "disability"
    t.string "sped_level_of_need"
    t.string "plan_504"
    t.string "limited_english_proficiency"
    t.integer "most_recent_mcas_math_growth"
    t.integer "most_recent_mcas_ela_growth"
    t.string "most_recent_mcas_math_performance"
    t.string "most_recent_mcas_ela_performance"
    t.integer "most_recent_mcas_math_scaled"
    t.integer "most_recent_mcas_ela_scaled"
    t.integer "most_recent_star_reading_percentile"
    t.integer "most_recent_star_math_percentile"
    t.string "enrollment_status"
    t.datetime "date_of_birth"
    t.string "gender"
    t.string "primary_phone"
    t.string "primary_email"
    t.text "house"
    t.text "counselor"
    t.text "sped_liaison"
    t.boolean "missing_from_last_export", default: false, null: false
    t.date "ell_entry_date"
    t.date "ell_transition_date"
    t.index ["enrollment_status"], name: "index_students_on_enrollment_status"
    t.index ["homeroom_id"], name: "index_students_on_homeroom_id"
    t.index ["local_id"], name: "index_students_on_local_id", unique: true
    t.index ["missing_from_last_export"], name: "index_students_on_missing_from_last_export"
    t.index ["school_id"], name: "index_students_on_school_id"
    t.index ["state_id"], name: "index_students_on_state_id"
  end

  create_table "tardies", id: :serial, force: :cascade do |t|
    t.date "occurred_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "student_id", null: false
    t.boolean "dismissed"
    t.boolean "excused"
    t.string "reason"
    t.string "comment"
    t.index ["student_id", "occurred_at"], name: "index_tardies_on_student_id_and_occurred_at", unique: true
    t.index ["student_id"], name: "index_tardies_on_student_id"
  end

  create_table "team_memberships", force: :cascade do |t|
    t.integer "student_id", null: false
    t.text "activity_text", null: false
    t.text "coach_text", null: false
    t.text "school_year_text", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "season_key"
  end

  create_table "transition_notes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "educator_id"
    t.bigint "student_id"
    t.text "text"
    t.datetime "recorded_at"
    t.boolean "is_restricted", default: false
    t.index ["educator_id"], name: "index_transition_notes_on_educator_id"
    t.index ["student_id"], name: "index_transition_notes_on_student_id"
  end

  add_foreign_key "absences", "students"
  add_foreign_key "class_list_snapshots", "class_lists"
  add_foreign_key "class_lists", "educators", column: "created_by_teacher_educator_id", name: "classrooms_for_created_by_educator_id_fk"
  add_foreign_key "class_lists", "educators", column: "revised_by_principal_educator_id", name: "class_lists_revised_by_principal_educator_id_fk"
  add_foreign_key "class_lists", "schools", name: "classrooms_for_grades_school_id_fk"
  add_foreign_key "counselor_meetings", "educators", name: "counselor_meetings_educator_id_fk"
  add_foreign_key "counselor_meetings", "students", name: "counselor_meetings_student_id_fk"
  add_foreign_key "counselor_name_mappings", "educators", name: "counselor_name_mappings_educator_id_fk"
  add_foreign_key "courses", "schools", name: "courses_school_id_fk"
  add_foreign_key "dibels_results", "students"
  add_foreign_key "discipline_incidents", "students"
  add_foreign_key "ed_plan_accommodations", "ed_plans"
  add_foreign_key "ed_plans", "students"
  add_foreign_key "educator_labels", "educators", name: "educator_labels_educator_id_fk"
  add_foreign_key "educator_multifactor_configs", "educators"
  add_foreign_key "educator_searchbars", "educators"
  add_foreign_key "educator_searchbars", "educators", name: "educator_searchbars_educator_id_fk"
  add_foreign_key "educator_section_assignments", "educators"
  add_foreign_key "educator_section_assignments", "sections"
  add_foreign_key "educators", "schools", name: "educators_school_id_fk"
  add_foreign_key "event_note_attachments", "event_notes", name: "event_note_attachments_event_note_id_fk"
  add_foreign_key "event_note_revisions", "educators", name: "event_note_revisions_educator_id_fk"
  add_foreign_key "event_note_revisions", "event_note_types"
  add_foreign_key "event_note_revisions", "event_notes"
  add_foreign_key "event_note_revisions", "event_notes", name: "event_note_revisions_event_note_id_fk"
  add_foreign_key "event_note_revisions", "students", name: "event_note_revisions_student_id_fk"
  add_foreign_key "event_notes", "educators", name: "event_notes_educator_id_fk"
  add_foreign_key "event_notes", "event_note_types"
  add_foreign_key "event_notes", "event_note_types", name: "event_notes_event_note_type_id_fk"
  add_foreign_key "event_notes", "students", name: "event_notes_student_id_fk"
  add_foreign_key "f_and_p_assessments", "educators", column: "uploaded_by_educator_id"
  add_foreign_key "f_and_p_assessments", "students"
  add_foreign_key "historical_grades", "sections", name: "historical_grades_section_id_fk"
  add_foreign_key "historical_grades", "students", name: "historical_grades_student_id_fk"
  add_foreign_key "homerooms", "educators", name: "homerooms_educator_id_fk"
  add_foreign_key "homerooms", "educators", name: "homerooms_for_educator_id_fk"
  add_foreign_key "homerooms", "schools", name: "homerooms_for_school_id_fk"
  add_foreign_key "homerooms", "schools", name: "homerooms_school_id_fk"
  add_foreign_key "homework_help_sessions", "educators", column: "recorded_by_educator_id", name: "homework_help_sessions_recorded_by_educator_id_fk"
  add_foreign_key "homework_help_sessions", "students", name: "homework_help_sessions_student_id_fk"
  add_foreign_key "house_educator_mappings", "educators", name: "house_educator_mappings_educator_id_fk"
  add_foreign_key "iep_documents", "students", name: "iep_documents_student_id_fk"
  add_foreign_key "imported_forms", "educators"
  add_foreign_key "imported_forms", "students"
  add_foreign_key "interventions", "educators", name: "interventions_educator_id_fk"
  add_foreign_key "interventions", "intervention_types", name: "interventions_intervention_type_id_fk"
  add_foreign_key "interventions", "students", name: "interventions_student_id_fk"
  add_foreign_key "masquerading_logs", "educators"
  add_foreign_key "masquerading_logs", "educators", column: "masquerading_as_educator_id"
  add_foreign_key "reading_benchmark_data_points", "educators"
  add_foreign_key "reading_benchmark_data_points", "students"
  add_foreign_key "reading_grouping_snapshots", "educators"
  add_foreign_key "reading_grouping_snapshots", "schools"
  add_foreign_key "second_transition_notes", "educators"
  add_foreign_key "second_transition_notes", "students"
  add_foreign_key "sections", "courses", name: "sections_course_id_fk"
  add_foreign_key "service_uploads", "educators", column: "uploaded_by_educator_id", name: "service_uploads_uploaded_by_educator_id_fk"
  add_foreign_key "services", "educators", column: "discontinued_by_educator_id", name: "services_discontinued_by_educator_id_fk"
  add_foreign_key "services", "educators", column: "recorded_by_educator_id", name: "services_recorded_by_educator_id_fk"
  add_foreign_key "services", "service_types", name: "services_service_type_id_fk"
  add_foreign_key "services", "service_uploads", name: "services_service_upload_id_fk"
  add_foreign_key "services", "students", name: "services_student_id_fk"
  add_foreign_key "star_math_results", "students"
  add_foreign_key "star_reading_results", "students"
  add_foreign_key "student_assessments", "assessments", name: "student_assessments_assessment_id_fk"
  add_foreign_key "student_assessments", "students", name: "student_assessments_student_id_fk"
  add_foreign_key "student_photos", "students"
  add_foreign_key "student_section_assignments", "sections"
  add_foreign_key "student_section_assignments", "sections", name: "student_section_assignments_section_id_fk"
  add_foreign_key "student_section_assignments", "students"
  add_foreign_key "student_section_assignments", "students", name: "student_section_assignments_student_id_fk"
  add_foreign_key "student_voice_completed_surveys", "student_voice_survey_uploads", name: "student_voice_completed_surveys_for_student_voice_survey_upload"
  add_foreign_key "student_voice_completed_surveys", "students", name: "student_voice_completed_surveys_for_student_id_fk"
  add_foreign_key "student_voice_survey_uploads", "educators", column: "uploaded_by_educator_id", name: "student_voice_survey_uploads_for_uploaded_by_educator_id_fk"
  add_foreign_key "students", "homerooms", name: "students_homeroom_id_fk"
  add_foreign_key "students", "schools", name: "students_school_id_fk"
  add_foreign_key "tardies", "students"
  add_foreign_key "team_memberships", "students"
  add_foreign_key "transition_notes", "educators"
  add_foreign_key "transition_notes", "students"
end
