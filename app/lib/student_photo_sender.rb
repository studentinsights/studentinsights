# Intended to be used in controller
class StudentPhotoSender
  # return render json: { error: 'no photo' }, status: 404

  # Returns [bytes, params] for passing to `send_data`
  # controller method, nil if no photo.
  def send_params(student, &block)
    student_photo = student.student_photos.order(created_at: :desc).first
    return nil if student_photo.nil?

    s3_filename = student_photo.s3_filename
    object = s3.get_object(key: s3_filename, bucket: ENV['AWS_S3_PHOTOS_BUCKET'])
    bytes = object.body.read
    options = {
      filename: s3_filename,
      type: 'image/jpeg'
    }

    [bytes, options]
  end

  private
  def s3
    if EnvironmentVariable.is_true('USE_PLACEHOLDER_STUDENT_PHOTO')
      @client ||= MockAwsS3.with_student_photo_mocked
    else
      @client ||= Aws::S3::Client.new
    end
  end
end
