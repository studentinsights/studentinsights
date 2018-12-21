class ReadingController < ApplicationController
  before_action :authorize!

  def grade_json
    safe_params = params.permit(:school_id, :grade)

    # def authorized(&block)
    #   authorizer = Authorizer.new(Educator.find_by_login_name('ldap_user2'))
    #   authorizer.authorized(&block)
    # end

    # school_id, grade = [2, '3']
    # puts latest_mtss_notes_json(school_id, grade).to_json;nil
    # puts reading_students_json(school_id, grade).to_json;nil

    render json: {
      latest_mtss_notes: JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER2/2018-12-07-reading/hea-mtss.json')), # latest_mtss_notes_json
      reading_students: JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER2/2018-12-07-reading/hea-reading-students.json')), # reading_students_json(safe_params[:school_id], safe_params[:grade]),
      dibels_data_points: JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER2/2018-12-07-reading/hea-dibels.json')),
    }
  end

  private
  def authorize!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_reading_grade')
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
end
