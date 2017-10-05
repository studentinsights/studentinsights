class ServicesController < ApplicationController
  rescue_from Exceptions::EducatorNotAuthorized, with: :redirect_unauthorized!
  before_action :authorize!

  def authorize!
    student = Service.find(params[:id]).student
    educator = current_educator
    raise Exceptions::EducatorNotAuthorized unless educator.is_authorized_for_student(student)
  end

  def destroy
    service_id = params[:id]
    if Service.find(service_id).date_started > Time.now
      Service.find(service_id).destroy
      respond_to do |format|
        format.json { head :no_content }
      end
      #format.json { head :no_content }
      #redirect_back(fallback_location: root_path)
    else
      discontinued_service = DiscontinuedService.new({
        service_id: service_id,
        recorded_by_educator_id: current_educator.id,
        discontinued_at: Time.now
      })

      serializer = ServiceSerializer.new(Service.find(service_id))
      discontinued_service.save
      render json: serializer.serialize_service
      #render json: { errors: discontinued_service.errors.full_messages }, status: 422
    end
  end
end
