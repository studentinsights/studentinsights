class ReadingController < ApplicationController
  before_action :authorize_for_grade_level!

  def reading_json
    safe_params = params.permit(:school_slug, :grade)
    school = School.find_by_slug(safe_params[:school_slug])
    grade = safe_params[:grade]
    raise Exceptions::EducatorNotAuthorized if school.nil? or grade.nil?

    render json: {
      school: school.as_json(only: [:id, :slug, :name]),
      reading_students: reading_students_json(school.id, grade),
      dibels_data_points: [], # TODO(kr)
      latest_mtss_notes: latest_mtss_notes_json(school.id, grade)
    }
  end

  # PUT
  # fine-grained cell-level edits to minimize conflicts
  # idempotent, last write wins
  # client emphasizes notifications and changelog rather than safeguards
  def update_data_point_json
    # safe_params = params.permit(:student_id, :grade, :, :assessment_key, :json)

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

  # # Can they read any student at that grade level?
  # def is_authorized_to_read?(school, grade)
  #   # they have label

  #   # either:
  #   # 1) they can access any third grade students?
  #   # 2) their homeroom has any third grade students
  #   #    they have grade-level access
  #   #    they have schoolwide access
  # end

  # def is_authorized_to_write?(school, grade)
  #   # they can access that third grade student's profile
  #   # (assumes reading specialists, instructional coaches have schoolwide or
  #   # gradewide access)
  # end

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

  # TODO add back authorizer block
  # TODO limit student fields
  # TODO what about active ed plans only?
  # TODO need older DIBELS data still, or F&P?
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

  def dibels_data_points
    []
  end
end
