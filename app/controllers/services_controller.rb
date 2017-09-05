class ServicesController < ApplicationController
  include SerializeDataHelper

  rescue_from Exceptions::EducatorNotAuthorized, with: :redirect_unauthorized!
  before_action :authorize!

  def authorize!
    student = Service.find(params[:id]).student
    educator = current_educator
    raise Exceptions::EducatorNotAuthorized unless educator.is_authorized_for_student(student)
  end

  def destroy
    service_id = params[:id]
    discontinued_service = DiscontinuedService.new({
      service_id: service_id,
      recorded_by_educator_id: current_educator.id,
      discontinued_at: Time.now
    })
    if discontinued_service.save
      render json: serialize_service(Service.find(service_id))
    else
      render json: { errors: discontinued_service.errors.full_messages }, status: 422
    end
  end
end
