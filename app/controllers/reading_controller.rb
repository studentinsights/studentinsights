class ReadingController < ApplicationController
  before_action :authorize!

  def grade_json
    safe_params = params.permit(:school_id, :grade)

    render json: {
      reading_students: JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER2/2018-12-07-reading/hea.json')), # reading_students_json(safe_params[:school_id], safe_params[:grade]),
      dibels_data_points: JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER2/2018-12-07-reading/hea-dibels.json')),
    }
  end

  private
  def authorize!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_reading_grade')
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
    end

    students.as_json({
        methods: [
          :star_reading_results,
          :dibels_results,
          :f_and_p_assessments
        ],
        include: {
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
