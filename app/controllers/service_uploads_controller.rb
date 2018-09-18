class ServiceUploadsController < ApplicationController
  before_action :ensure_authorized!

  def create
    service_upload = ServiceUpload.new(
      file_name: params['file_name'],
      uploaded_by_educator_id: current_educator.id
    )

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

        unless service.update_attributes(:discontinued_at => date_ended, :discontinued_by_educator_id => current_educator.id)
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
    def ensure_authorized!
      raise Exceptions::EducatorNotAuthorized unless current_educator.can_set_districtwide_access?
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
