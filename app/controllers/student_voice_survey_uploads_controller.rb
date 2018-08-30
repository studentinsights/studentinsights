class StudentVoiceSurveyUploadsController < ApplicationController
  before_action :ensure_authorized!
  before_action :ensure_feature_is_enabled!

  def index
    authorized_student_ids = authorized { Student.all.select(:id) }.map(&:id)
    student_voice_survey_uploads = StudentVoiceSurveyUpload.where(student_id: authorized_student_ids)
    student_voice_survey_upload_json = student_voice_survey_uploads.all.as_json({
      includes: {
        student: {
          only: [:id, :first_name, :last_name, :grade]
        },
        educator: {
          only: [:id, :full_name, :email]
        }
      }
    })
    render json: {
      student_voice_survey_upload: student_voice_survey_upload_json
    }
  end

  # post
  def upload
    safe_params = params.permit(:file_name, :service_type_name, :student_lasids)
    # service_upload = ServiceUpload.new(
    #   file_name: params['file_name'],
    #   uploaded_by_educator_id: current_educator.id
    # )

    # if service_upload.invalid?
    #   return render json: {
    #     errors: ['Service upload invalid. Maybe the file name is missing or not unique?']
    #   }
    # end

    # service_upload.save!

    # service_type = ServiceType.find_by_name(params['service_type_name'])

    # if service_type.nil?
    #   return render json: {
    #     errors: ['Service Type not found...']
    #   }
    # end

    # errors = []

    # params['student_lasids'].map do |student_lasid|
    #   student = Student.find_by_local_id(student_lasid)

    #   if student.present?
    #     service = Service.create!(
    #       student: student,
    #       service_upload: service_upload,
    #       recorded_by_educator: current_educator,
    #       service_type: service_type,
    #       recorded_at: recorded_at,
    #       date_started: date_started
    #     )

    #     return unless date_ended

    #     unless service.update_attributes(:discontinued_at => date_ended, :discontinued_by_educator_id => current_educator.id)
    #       errors << "Could not save service end date. (Must end after service start date.)"
    #     end
    #   end
    # end

    # render json: { service_upload: service_upload.as_json(
    #   only: [:created_at, :file_name, :id],
    #   include: {
    #     services: {
    #       only: [],
    #       include: {
    #         student: {
    #           only: [:first_name, :last_name, :id]
    #         },
    #         service_type: {
    #           only: [:name]
    #         }
    #       }
    #     }
    #   }
    # )}.merge({ errors: errors })
  end

  # delete
  def destroy
    # id = params[:id]
    # service_upload = ServiceUpload.find_by_id(id)

    # if service_upload.destroy
    #   render json: {
    #     success: true,
    #     id: id
    #   }
    # end
  end

  private
  def ensure_authorized!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('can_upload_student_voice_surveys')
  end

  def ensure_feature_is_enabled!
    raise Exceptions::EducatorNotAuthorized unless PerDistrict.new.enabled_student_voice_surveys?
  end
end
