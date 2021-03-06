class ServicesController < ApplicationController
  before_action :authorize!

  def destroy
    service_id = params[:id]
    service = Service.find(service_id)
    serializer = ServiceSerializer.new(service)

    if service.update(:discontinued_at => Time.now, :discontinued_by_educator_id => current_educator.id)
      render json: serializer.serialize_service
    else
      render json: { errors: service.errors.full_messages }, status: 422
    end
  end

  private
  def authorize!
    student = Service.find(params[:id]).student
    educator = current_educator
    raise Exceptions::EducatorNotAuthorized unless educator.is_authorized_for_student(student)
  end
end
