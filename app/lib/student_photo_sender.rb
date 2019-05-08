# Intended to be used in controller
class StudentPhotoSender
  def initialize(s3_client)
    @s3_client = s3_client
  end
  # return render json: { error: 'no photo' }, status: 404

  # Returns [bytes, params] for passing to `send_data`
  # controller method, nil if no photo.
  def send_params(student)
    student_photo = student.student_photos.order(created_at: :desc).first
    return nil if student_photo.nil?

    s3_filename = student_photo.s3_filename
    object = @s3_client.get_object(key: s3_filename, bucket: ENV['AWS_S3_PHOTOS_BUCKET'])
    bytes = object.body.read
    options = {
      filename: s3_filename,
      type: 'image/jpeg'
    }

    [bytes, options]
  end
end
