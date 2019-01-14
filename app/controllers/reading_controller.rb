class ReadingController < ApplicationController
  before_action :authorize_for_grade_level!

  # cases:
  # 1) don't show
  # 2) show, link directly to (school, grade, period)
  # 3) show, link to coverage page for (period)
  def reading_benchmark_entry_box_json
    # If the educator only works with one school and one grade,
    # suggest that directly
    direct_entry_params = infer_direct_entry_link
    render json: {
      educator_labels: current_educator.labels,
      benchmark_period_key: 'winter',
      direct_entry_params: direct_entry_params
    }
  end

  def school_grade_json
    safe_params = params.permit(:school_id, :grade)
    school_id = safe_params[:school_id]
    grade = safe_params[:grade]

    render json: {
      latest_mtss_notes: latest_mtss_notes_json,
      reading_students: reading_students_json(school_id, grade),
      dibels_data_points: []
    }
  end

  # PUT
  # fine-grained cell-level edits to minimize conflicts
  # idempotent, last write wins
  # client emphasizes notifications and changelog rather than safeguards
  def update_data_point_json
    safe_params = params.permit(:student_id, :grade, :season_key, :assessment_key, :json)

    # is authorized to access student at the grade level
    # is authorized to write reading data
    # (grade and season_key don't have to match current)
    # is assessment_key valid
    # is format of json valid
    # write it
    render json: {
      status: 'ok'
    }
  end

  private
  def authorize_for_grade_level!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_reading_grade')
  end

  # Can they read any student at that grade level?
  def is_authorized_to_read?(school, grade)
    # they have label

    # either:
    # 1) they can access any third grade students?
    # 2) their homeroom has any third grade students
    #    they have grade-level access
    #    they have schoolwide access
  end

  def is_authorized_to_write?(school, grade)
    # they can access that third grade student's profile
    # (assumes reading specialists, instructional coaches have schoolwide or
    # gradewide access)
  end

  def infer_direct_entry_link
    students = authorized { Student.active }
    grades = students.map(&:grade).uniq
    school_id = students.map(&:school_id).uniq

    if grades.length === 1 && school_id.length === 1
      [school_id, grade]
    else
      nil
    end
  end

  def latest_mtss_notes_json(school_id, grade)
    students = authorized do
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
    students = authorized do
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

    # TODO add back authorizer block
    # TODO limit student fields
    # TODO what about active ed plans only?
    students.as_json({
        methods: [
          :star_reading_results,
          :dibels_results,
          :access
        ],
        include: {
          ed_plans: {
            include: :ed_plan_accommodations
          },
          f_and_p_assessments: {
            only: [:benchmark_date, :instructional_level, :f_and_p_code]
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

  def dibels_data_points
    []
  end
end
