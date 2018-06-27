class IsServiceWorkingController < ApplicationController
  before_action :authorize_for_districtwide_access_admin

  def authorize_for_districtwide_access_admin
    unless current_educator.admin? && current_educator.districtwide_access?
      raise Exceptions::EducatorNotAuthorized
    end
  end

  def is_service_working_json
    service_type_id = params[:service_type_id]
    service_type = ServiceType.find(service_type_id)

    student_ids = service_type.services.where('date_started > ?', Time.current - 1.year).map(&:student_id)

    chart_data = Student.active.where(id: student_ids).map do |student|
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
