class ReadingController < ApplicationController
  before_action :ensure_authorized_for_feature!

  def reading_json
    safe_params = params.permit(:school_slug, :grade)
    school = School.find_by_slug(safe_params[:school_slug])
    grade = safe_params[:grade]
    raise Exceptions::EducatorNotAuthorized unless is_authorized_for_grade_level?(school.id, grade)

    render json: {
      school: school.as_json(only: [:id, :slug, :name]),
      reading_students: reading_students_json(school.id, grade),
      latest_mtss_notes: latest_mtss_notes_json(school.id, grade)
    }
  end

  # PUT
  # This allows fine-grained, cell-level edits to minimize conflicts.
  # This is idempotent with no conflict resolution; last write wins.
  # Client code emphasizes showing notifications and the changelog
  # rather than trying to resolve conflicts using locks (with the idea
  # that concurrent editing will be unlikely in practice outside of
  # direct collaboration, where changelogs and notifications are
  # preferable anyway).
  def update_data_point_json
    safe_params = params.permit(*[
      :student_id,
      :school_id,
      :grade,
      :benchmark_school_year,
      :benchmark_period_key,
      :benchmark_assessment_key,
      :value
    ])
    benchmark_school_year = safe_params[:benchmark_school_year]
    benchmark_period_key = safe_params[:benchmark_period_key]
    raise Exceptions::EducatorNotAuthorized unless is_authorized_for_grade_level?(safe_params[:school_id], safe_params[:grade])
    raise Exceptions::EducatorNotAuthorized unless is_open_for_writing?(benchmark_school_year, benchmark_period_key)

    ReadingBenchmarkDataPoint.create!({
      student_id: safe_params[:student_id],
      benchmark_school_year: benchmark_school_year,
      benchmark_period_key: benchmark_period_key,
      benchmark_assessment_key: safe_params[:benchmark_assessment_key],
      json: {
        value: safe_params[:value]
      },
      educator_id: current_educator.id
    })

    render json: {
      status: 'ok'
    }
  end

  private
  def ensure_authorized_for_feature!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_reading_grade')
  end

  # Authorization for reading features only (not general-purpose access).
  # Permissions are complex across reading specialists, ELL and
  # special education teachers, and instructional coaches, so this is
  # used for fine-grained access during in-person testing.
  def is_authorized_for_grade_level?(school_id, grade)
    reading_authorizations = JSON.parse(ENV.fetch('READING_AUTHORIZATIONS_JSON', '{}'))
    educator_login_names = reading_authorizations.fetch("#{school_id}:#{grade}")
    educator_login_names.include?(current_educator.login_name)
  end

  def authorized_for_grade_level(school_id, grade, &block)
    return [] unless is_authorized_for_grade_level?(school_id, grade)
    block.call
  end

  def is_open_for_writing?(benchmark_school_year, benchmark_period_key)
    benchmark_school_year == 2018 && benchmark_period_key == 'winter'
  end

  def latest_mtss_notes_json(school_id, grade)
    students = authorized_for_grade_level(school_id, grade) do
      Student
        .active
        .where(school_id: school_id)
        .where(grade: grade)
    end

    notes = authorized do
      EventNote
        .where(event_note_type_id: 301)
        .where(student_id: students.pluck(:id))
    end

    notes.as_json(only: [:id, :student_id, :recorded_at])
  end

  def reading_students_json(school_id, grade)
    students = authorized_for_grade_level(school_id, grade) do
      Student
        .active
        .where(school_id: school_id)
        .where(grade: grade)
        .includes(homeroom: :educator)
        .includes(:star_reading_results)
        .includes(:dibels_results)
        .includes(:f_and_p_assessments)
        .includes(:reading_benchmark_data_points)
        .to_a
    end

    students.as_json({
      only: [
        :id,
        :first_name,
        :last_name,
        :grade,
        :plan_504,
        :limited_english_proficiency,
        :ell_transition_date
      ],
      methods: [
        :star_reading_results,
        :dibels_results,
        :access
      ],
      include: {
        reading_benchmark_data_points: {
          only: [:id, :benchmark_school_year, :benchmark_period_key, :benchmark_assessment_key, :json],
          include: {
            educator: {
              only: [:id, :email, :full_name]
            }
          }
        },
        f_and_p_assessments: {
          only: [:benchmark_date, :instructional_level, :f_and_p_code]
        },
        ed_plans: {
          include: :ed_plan_accommodations
        },
        latest_iep_document: {
          only: [:id]
        },
        homeroom: {
          only: [:id, :slug, :name],
          include: {
            educator: {
              only: [:id, :email, :full_name]
            }
          }
        }
      }
    })
  end
end
