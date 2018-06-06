class PhotoStorer
  def initialize(path_to_file:,
                 local_id:,
                 s3_client:,
                 logger:,
                 time_now:)
    @path_to_file = path_to_file
    @local_id = local_id
    @s3_client = s3_client
    @logger = logger
    @time_now = time_now
  end

  # On success, returns StudentPhoto.
  # Returns nil if we already have image or on error writing to S3
  # we can't control.  Logs messages for success or different error cases.
  def store_only_new
    return @logger.info("student not in db!") unless student

    # Digest file and check if we already have this image
    return nil if photo_already_exists?

    # Then store it in S3
    s3_filename = store_object_in_s3
    return nil if s3_filename.nil?

    # And add a record referencing it in the database
    create_student_photo_record(s3_filename)
  end

  private
  def photo_already_exists?(image_file_digest)
    StudentPhoto.find_by({
      file_digest: image_file_digest,
      file_size: file_size
    }).present?
  end

  # Returns filename on success, nil on error
  def store_object_in_s3
    @logger.info("storing photo for student ##{@student.id} to s3...")

    # s3 filenames are sorted by (student / upload date / image)
    s3_filename = [
      Digest::SHA256.hexdigest(@local_id),
      @time_now.strftime('%Y-%m-%d'),
      image_file_digest
    ].join('/')
    response = @client.put_object(
      bucket: ENV['AWS_S3_PHOTOS_BUCKET'],
      key: s3_filename,
      body: File.open(@path_to_file),
      server_side_encryption: 'AES256'
    )

    if response
      @logger.info("    successfully stored to s3!")
      @logger.info("    encrypted with: #{response[:server_side_encryption]}")
      s3_filename
    else
      @logger.info("    error storing photo in s3.")
      nil
    end
  end

  def create_student_photo_record(s3_filename)
    student_photo = StudentPhoto.create({
      student_id: @student.id,
      file_digest: image_file_digest,
      file_size: file_size,
      s3_filename: s3_filename
    })
    if !student_photo
      @logger.info('    could not create StudentPhoto record')
      nil
    elsif !student.update(student_photo_id: student_photo.id)
      @logger.info('    could not update Student record')
      nil
    else
      student_photo
    end
  end

  private
  def student
    @student ||= Student.find_by_local_id(@local_id)
  end

  def image_file_digest
    @image_file_digest ||= Digest::SHA256.file(@path_to_file).to_s
  end

  def file_size
    @file_size ||= File.size(@path_to_file)
  end
end
