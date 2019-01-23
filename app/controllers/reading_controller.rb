class ReadingController < ApplicationController
  before_action :ensure_authorized_for_feature!

  # Used in grouping
  def teams_json
    schools = School.select {|school| !school.is_high_school? }.as_json(only: [:id, :slug, :name])
    grades = ['KF', '1', '2', '3', '4', '5']
    educators = Educator.all.as_json({
      only: [:id, :full_name],
      include: {
        homeroom: {
          only: [:id, :name, :grade]
        }
      }
    })

    render json: {
      schools: schools,
      grades: grades,
      educators: educators,
      benchmark_windows: benchmark_windows_open_for_writing
    }
  end

  # Snapshot of state when grouping
  def grouping_snapshot_json
    params.require(:school_id)
    params.require(:grade)
    params.require(:grouping_workspace_id)
    params.require(:benchmark_school_year)
    params.require(:benchmark_period_key)
    params.require(:snapshot_json)
    raise Exceptions::EducatorNotAuthorized unless is_authorized_for_grade_level?(params[:school_id], params[:grade])
    raise Exceptions::EducatorNotAuthorized unless is_open_for_writing?(params[:benchmark_school_year], params[:benchmark_period_key])
    ReadingGroupingSnapshot.create!({
      grouping_workspace_id: params[:grouping_workspace_id],
      school_id: params[:school_id],
      grade: params[:grade],
      benchmark_school_year: params[:benchmark_school_year],
      benchmark_period_key: params[:benchmark_period_key],
      snapshot_json: params[:snapshot_json],
      educator_id: current_educator.id
    })

    render json: {}, status: 201
  end


  # Used for multiple pages (eg, entry, grouping)
  def reading_json
    safe_params = params.permit(:school_slug, :grade)
    school = School.find_by_slug(safe_params[:school_slug])
    grade = safe_params[:grade]
    raise Exceptions::EducatorNotAuthorized unless is_authorized_for_grade_level?(school.id, grade)

    render json: {
      school: school.as_json(only: [:id, :slug, :name]),
      entry_doc: entry_doc_json(school.id, grade),
      reading_students: reading_students_json(school.id, grade),
      latest_mtss_notes: latest_mtss_notes_json(school.id, grade)
    }
  end

  # PUT
  # This allows fine-grained, cell-level edits to minimize conflicts,
  # Semantics are: idempotent, last write wins.  Storage is append-only.
  #
  # The idea is that concurrent editing will be unlikely in practice
  # outside of direct collaboration, where changelogs and notifications
  # are preferable to locks or conflict resolution anyway.
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

    render json: {}, status: 201
  end

  private
  def ensure_authorized_for_feature!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_reading_benchmark_data_entry')
  end

  # Authorization for reading features only (not general-purpose access).
  # Permissions are complex across reading specialists, ELL and
  # special education teachers, and instructional coaches, so this is
  # used for fine-grained access during in-person testing.
  def is_authorized_for_grade_level?(school_id, grade)
    educator_authorizations_json = JSON.parse(ENV.fetch('READING_ENTRY_EDUCATOR_AUTHORIZATIONS_JSON', '{}'))
    educator_login_names = educator_authorizations_json.fetch("#{school_id}:#{grade}", [])
    educator_login_names.include?(current_educator.login_name)
  end

  # Placeholder, similar to Authorizer#authorized but for grade-level
  # access to reading data only.
  def authorized_by_grade_level(school_id, grade, &block)
    return [] unless is_authorized_for_grade_level?(school_id, grade)
    block.call
  end

  # This happens in cycles; the intention is that a literacy coach
  # manages this.
  def is_open_for_writing?(benchmark_school_year, benchmark_period_key)
    benchmark_windows_open_for_writing.any? do |period|
      (
        benchmark_school_year.to_i == period[:benchmark_school_year].to_i &&
        benchmark_period_key == period[:benchmark_period_key]
      )
    end
  end

  def benchmark_windows_open_for_writing
    open_benchmark_periods_json = JSON.parse(ENV.fetch('READING_ENTRY_OPEN_BENCHMARK_PERIODS_JSON', '{}'))
    open_benchmark_periods_json.fetch('periods', []).map {|json| json.symbolize_keys }
  end

  # queries
  # `doc` is shaped like:
  # {
  #   [student_id]:{
  #     [benchmark_assessment_key]: value
  #    }
  #  }
  def entry_doc_json(school_id, grade)
    student_ids = authorized_by_grade_level(school_id, grade) do
      Student
        .active
        .where(school_id: school_id)
        .where(grade: grade)
    end
    data_points = ReadingBenchmarkDataPoint.where({
      benchmark_school_year: 2018,
      benchmark_period_key: 'winter',
      student_id: student_ids
    }).order(updated_at: :asc)
    doc = data_points.reduce({}) do |map, data_point|
      map.merge({
        data_point.student_id => map.fetch(data_point.student_id, {}).merge({
          data_point.benchmark_assessment_key => data_point.json['value']
        })
      })
    end
    doc.as_json
  end

  def latest_mtss_notes_json(school_id, grade)
    students = authorized_by_grade_level(school_id, grade) do
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
    students = authorized_by_grade_level(school_id, grade) do
      Student
        .active
        .where(school_id: school_id)
        .where(grade: grade)
        .includes(homeroom: :educator)
        .includes(:star_reading_results)
        .includes(:dibels_results)
        .includes(:f_and_p_assessments)
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
        :ell_transition_date,
        :program_assigned,
        :sped_level_of_need,
        :disability,
        :sped_placement
      ],
      methods: [
        :star_reading_results,
        :dibels_results,
        :access
      ],
      include: {
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
