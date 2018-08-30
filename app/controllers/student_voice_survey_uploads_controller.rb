class StudentVoiceSurveyUploadsController < ApplicationController
  before_action :ensure_authorized!
  before_action :ensure_feature_is_enabled!

  def index
    student_voice_survey_uploads = StudentVoiceSurveyUpload.all.order(created_at: :desc)
    student_voice_survey_uploads_json = student_voice_survey_uploads.as_json({
      only: [
        :id,
        :file_name,
        :file_size,
        :file_digest,
        :stats,
        :completed,
        :created_at
      ],
      include: {
        uploaded_by_educator: {
          only: [:id, :full_name, :email]
        },
        students: {
          only: [:id, :first_name, :last_name, :grade]
        }
      }
    })
    render json: {
      student_voice_survey_uploads: student_voice_survey_uploads_json,
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
    student_voice_survey_upload = uploader.create_from_text!
    render json: {
      stats: student_voice_survey_upload.stats
    }
  end

  def ensure_authorized!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('can_upload_student_voice_surveys')
  end

  def ensure_feature_is_enabled!
    raise Exceptions::EducatorNotAuthorized unless PerDistrict.new.enabled_student_voice_survey_uploads?
  end
end
