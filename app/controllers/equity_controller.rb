class EquityController < ApplicationController
  before_action :ensure_authorized!

  def stats_by_school_json
    grades = ['KF', '1', '2', '3', '4', '5', '6', '7', '8']
    students = authorized { Student.active.where(grade: grades).to_a }
    students_json = students.as_json({
      only: [
        :id,
        :local_id,
        :school_id,
        :homeroom_id,
        :first_name,
        :last_name,
        :grade,
        :date_of_birth,
        :disability,
        :program_assigned,
        :limited_english_proficiency,
        :plan_504,
        :home_language,
        :free_reduced_lunch,
        :race,
        :hispanic_latino,
        :gender,
        :most_recent_star_math_percentile,
        :most_recent_star_reading_percentile
      ],
      methods: [
        :latest_note,
        :latest_iep_document,
        :latest_access_results,
        :latest_dibels,
        :winter_reading_doc,
        :most_recent_school_year_discipline_incidents_count
      ]
    })
    render json: {
      students: students_json
    }
  end

  def classlists_equity_index_json
    ensure_class_lists_are_enabled!

    queries = ClassListQueries.new(current_educator)
    workspaces = queries.all_authorized_workspaces
    json = Herfindahl.new.with_dimensions_json(workspaces)

    render json: json
  end

  private
  def ensure_class_lists_are_enabled!
    is_enabled = PerDistrict.new.enabled_class_lists?
    is_override_set = current_educator.labels.include?('enable_class_lists_override')
    raise Exceptions::EducatorNotAuthorized unless (is_enabled || is_override_set)
  end

  def ensure_authorized!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_equity_experiments')
  end
end
