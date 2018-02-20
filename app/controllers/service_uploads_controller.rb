class ServiceUploadsController < ApplicationController
  # Authentication by default inherited from ApplicationController.

  before_action :authorize_for_districtwide_access_admin # Extra authentication layer

  def authorize_for_districtwide_access_admin
    unless current_educator.admin? && current_educator.districtwide_access?
      render json: { error: "You don't have the correct authorization." }
    end
  end

  def create
    service_upload = ServiceUpload.new(
      file_name: params['file_name'],
      uploaded_by_educator_id: current_educator.id
    )

    render_errors_as_json(service_upload.errors) and return if service_upload.invalid?

    service_upload.save!

    service_type_id = ServiceType.find_by_name(params['service_type_name']).id

    services_to_save = params['student_lasids'].map do |student_lasid|
      Service.new(
        student: Student.find_by_local_id(student_lasid),
        service_upload: service_upload,
        recorded_by_educator: current_educator,
        service_type_id: service_type_id,
        recorded_at: recorded_at,
        date_started: date_started,
        discontinued_at: date_ended,
        discontinued_by_educator_id: date_ended ? current_educator.id : nil
      )
    end

    invalid_services = services_to_save.any? { |service| service.invalid? }

    service_errors = services_to_save.map do |service_to_save|
      service_to_save.errors.messages
    end.compact

    render_errors_as_json(service_errors) and return if invalid_services

    render json: { service_upload: service_upload.as_json(
      only: [:created_at, :file_name, :id],
      include: {
        services: {
          only: [],
          include: {
            student: {
              only: [:first_name, :last_name, :id]
            },
            service_type: {
              only: [:name]
            }
          }
        }
      }
    )} and return
  end

  def index
    @serialized_data = {
      current_educator: current_educator,
      service_type_names: ServiceType.pluck(:name)
    }
    render 'shared/serialized_data'
  end

  def past
    render json: past_service_upload_json and return
  end

  def destroy
    id = params[:id]
    service_upload = ServiceUpload.find_by_id(id)

    if service_upload.destroy
      render json: {
        success: true,
        id: id
      }
    end
  end

  private

    def render_errors_as_json(errors)
      render json: { errors: errors }
    end

    def past_service_upload_json
      ServiceUpload.includes(services: [:student, :service_type])
                   .order(created_at: :desc)
                   .as_json(only: [:created_at, :file_name, :id],
                     include: {
                       services: {
                         only: [],
                         include: {
                           student: {
                             only: [:first_name, :last_name, :id]
                           },
                           service_type: {
                             only: [:name]
                           }
                         }
                       }
                     }
                   )
    end

    def recorded_at
      DateTime.current
    end

    def date_started
      Date.strptime(params['date_started'],  "%m/%d/%Y")
    end

    def date_ended
      Date.strptime(params['date_ended'],  "%m/%d/%Y")
    end

end
