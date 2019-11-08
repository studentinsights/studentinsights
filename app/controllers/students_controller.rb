class StudentsController < ApplicationController
  include ApplicationHelper

  before_action :authorize!

  def photo
    student = Student.find(params[:id])
    send_params = student_photo_sender.send_params(student)
    if send_params.nil?
      return render json: { error: 'no photo' }, status: 404
    end

    bytes, options = send_params
    send_data bytes, options
  end

  def latest_iep_document
    # guard
    safe_params = params.permit(:id, :format)
    student = authorized_or_raise! { Student.find(safe_params[:id]) }
    iep_document = student.latest_iep_document
    raise ActiveRecord::RecordNotFound if iep_document.nil?

    # download
    filename = iep_document.pretty_filename_for_download
    pdf_bytes = IepStorer.unsafe_read_bytes_from_s3(s3, iep_document)
    send_data pdf_bytes, filename: filename, type: 'application/pdf', disposition: 'inline'
  end

  # post
  def service
    clean_params = params.require(:service).permit(*[
      :student_id,
      :service_type_id,
      :date_started,
      :provided_by_educator_name,
      :estimated_end_date
    ])

    estimated_end_date = clean_params["estimated_end_date"]

    service = Service.new(clean_params.merge({
      recorded_by_educator_id: current_educator.id,
      recorded_at: Time.now
    }))

    serializer = ServiceSerializer.new(service)

    if service.save
      if estimated_end_date.present? && estimated_end_date.to_time < Time.now
        service.update_attributes!(:discontinued_at => estimated_end_date.to_time, :discontinued_by_educator_id => current_educator.id)
      end
      render json: serializer.serialize_service
    else
      render json: { errors: service.errors.full_messages }, status: 422
    end
  end

  private
  def authorize!
    student = Student.find(params[:id])
    raise Exceptions::EducatorNotAuthorized unless current_educator.is_authorized_for_student(student)
  end

  def s3
    @client ||= MockAwsS3.create_real_or_mock
  end

  def student_photo_sender
    @student_photo_sender ||= StudentPhotoSender.new(s3)
  end
end
