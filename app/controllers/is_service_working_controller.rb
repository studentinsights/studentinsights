class IsServiceWorkingController < ApplicationController
  before_action :authorize_for_districtwide_access_admin

  def authorize_for_districtwide_access_admin
    unless current_educator.admin? && current_educator.districtwide_access?
      raise Exceptions::EducatorNotAuthorized
    end
  end

  def is_service_working_json
    service_type_id = params[:service_type_id]

    students = authorized do
      Student.active.select do |student|
        student.services.where(service_type_id: service_type_id)
                        .where('date_started > ?', Time.current - 1.year)
                        .present?
      end
    end

    chart_data = students.map do |student|
      {
        student: student,
        school: student.school.local_id,
        services: student.services.where(service_type_id: service_type_id),
        absences: student.absences.order(occurred_at: :desc)
      }
    end

    render json: { chart_data: chart_data }
  end

end
