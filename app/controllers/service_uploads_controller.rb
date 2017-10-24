class ServiceUploadsController < ApplicationController
  # Authentication by default inherited from ApplicationController.

  before_action :authorize_for_districtwide_access_admin # Extra authentication layer

  def authorize_for_districtwide_access_admin
    unless current_educator.admin? && current_educator.districtwide_access?
      render json: { error: "You don't have the correct authorization." }
    end
  end

  def create
    service_upload = ServiceUpload.new(file_name: params['file_name'])

    if service_upload.invalid?
      return render json: {
        errors: ['Service upload invalid. Maybe the file name is missing or not unique?']
      }
    end

    service_upload.save!

    service_type = ServiceType.find_by_name(params['service_type_name'])

    if service_type.nil?
      return render json: {
        errors: ['Service Type not found...']
      }
    end

    errors = []

    params['student_lasids'].map do |student_lasid|
      student = Student.find_by_local_id(student_lasid)

      if student.present?
        service = Service.create!(
          student: student,
          service_upload: service_upload,
          recorded_by_educator: current_educator,
          service_type: service_type,
          recorded_at: recorded_at,
          date_started: date_started
        )

        return unless date_ended

        service.update_attributes(:discontinued_at => :date_ended, :discontinued_by_educator_id => current_educator)

        unless service.update_attributes(:discontinued_at => date_ended)
          errors << "Could not save service end date. (Must end after service start date.)"
        end
      end
    end

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
    )}.merge({ errors: errors })
  end

  def index
    @serialized_data = {
      current_educator: current_educator,
      service_uploads: ServiceUpload.order(created_at: :desc).as_json(
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
      ),
      service_type_names: ServiceType.pluck(:name)
    }
    render 'shared/serialized_data'
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
