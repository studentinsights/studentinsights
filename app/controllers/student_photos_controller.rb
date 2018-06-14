class StudentPhotosController < ApplicationController

  before_action :authorize!, :find_student_photo, :check_student_ids!

  def authorize!
    @student = Student.find(params[:student_id])
    educator = current_educator
    raise Exceptions::EducatorNotAuthorized unless educator && educator.is_authorized_for_student(@student)
  end

  def find_student_photo
    @student_photo = StudentPhoto.find(params[:id])
  end

  def check_student_ids!
    raise Exceptions::StudentIdDoesNotMatch unless @student_photo.student_id == params[:student_id].to_i
  end

  def show
    @s3_filename = @student_photo.s3_filename

    object = s3.get_object(key: @s3_filename, bucket: ENV['AWS_S3_PHOTOS_BUCKET'])

    send_data object.body.read, filename: @s3_filename, type: 'image/jpeg'
  end

  private

    def s3
      @client ||= Aws::S3::Client.new
    end

end
