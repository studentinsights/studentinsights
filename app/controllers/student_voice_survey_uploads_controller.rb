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
      student_voice_survey_upload: student_voice_survey_upload_json,
      student_voice_survey_form_url: PerDistrict.new.student_voice_survey_form_url
    }
  end

  # post
  def upload
    safe_params = params.permit(:file_name, :file_text)
    uploader = StudentVoiceSurveyUploader.new(safe_params[:file_text], {
      file_name: safe_params[:file_name],
      uploaded_by_educator_id: current_educator.id
    })
    upload_stats = uploader.create_rows_from_text!
    render json: {
      upload_status: upload_stats
    }
  end

  def ensure_authorized!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('can_upload_student_voice_surveys')
  end

  def ensure_feature_is_enabled!
    raise Exceptions::EducatorNotAuthorized unless PerDistrict.new.enabled_student_voice_survey_uploads?
  end
end
