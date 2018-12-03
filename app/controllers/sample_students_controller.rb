class SampleStudentsController < ApplicationController
  before_action :ensure_authorized!

  # Admin only; get a sample of students for looking at data across the site
  def sample_students_json
    seed = params.fetch(:seed, '42').to_i
    n = params.fetch(:n, '40').to_i
    authorized_sample_students = authorized do
      Student.active.sample(n, random: Random.new(seed))
    end
    sample_students_json = authorized_sample_students.as_json({
      only: [:id, :grade, :first_name, :last_name],
      include: {
        school: {
          only: [:id, :name, :school_type]
        }
      }
    })
    render json: {
      sample_students: sample_students_json
    }
  end

  private
  def ensure_authorized!
    raise Exceptions::EducatorNotAuthorized unless current_educator.can_set_districtwide_access?
  end
end
