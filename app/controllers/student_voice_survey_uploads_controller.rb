class StudentVoiceSurveyUploadsController < ApplicationController
  before_action :ensure_authorized!
  before_action :ensure_feature_is_enabled!

  def index
    authorized_student_ids = authorized { Student.all.select(:id) }.map(&:id)
    student_voice_survey_uploads = StudentVoiceSurveyUpload.where(student_id: authorized_student_ids)
    student_voice_survey_upload_json = student_voice_survey_uploads.as_json({
      only: [:file_digest, :file_name, :file_size, :created_at],
      include: {
        student: {
          only: [:id, :first_name, :last_name, :grade]
        },
        uploaded_by_educator: {
          only: [:id, :full_name, :email]
        }
      }
    })
    groups = student_voice_survey_upload_json.group_by {|json| json['file_digest']}
    uploads_json = groups.keys.map do |file_digest|
      records = groups[file_digest]
      whitelist = ['uploaded_by_educator', 'file_digest', 'file_name', 'file_size', 'created_at']
      unique_students_json = records.map {|json| json['student']}.uniq
      records.first.slice(*whitelist).merge({
        file_digest: file_digest,
        students: unique_students_json
      })
    end
    render json: {
      uploads: uploads_json,
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
