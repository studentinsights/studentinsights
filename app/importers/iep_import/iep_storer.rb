class IepStorer
  # No authorization check here
  def self.unsafe_read_bytes_from_s3(s3_client, iep_document)
    if ENV['USE_PLACEHOLDER_IEP_DOCUMENT']
      return File.read("#{Rails.root}/public/demo-blank-iep.pdf")
    end

    s3_filename = iep_document.s3_filename
    object = s3_client.get_object({
      key: s3_filename,
      bucket: ENV['AWS_S3_PHOTOS_BUCKET']
    })
    object.body.read
  end

  def initialize(file_name:,
                 path_to_file:,
                 local_id:,
                 client:,
                 logger:)
    @file_name = file_name
    @path_to_file = path_to_file
    @local_id = local_id
    @client = client
    @logger = logger
  end

  def store
    @student = Student.find_by_local_id(@local_id)
    if @student.nil?
      @logger.info("student local_id: #{@local_id} not found, dropping the IEP PDF file...")
      return nil
    end

    return nil unless store_object_in_s3

    store_object_in_database
  end

  def store_object_in_s3
    # Client is supplied with the proper creds via
    # ENV['AWS_ACCESS_KEY_ID'] and ENV['AWS_SECRET_ACCESS_KEY']

    @logger.info("storing iep for student ##{@student.id} to s3...")

    response = @client.put_object(
      bucket: ENV['AWS_S3_IEP_BUCKET'],
      key: @file_name,
      body: File.open(@path_to_file),
      server_side_encryption: 'AES256'
    )

    return false unless response

    @logger.info("    successfully stored to s3!")
    @logger.info("    encrypted with: #{response[:server_side_encryption]}")

    return true
  end

  def store_object_in_database

    document = IepDocument.find_by(student: @student)

    if document.present?
      @logger.info("updating iep record for student ##{@student.id}...")
      IepDocument.update(file_name: @file_name)
    else
      @logger.info("creating iep record for student ##{@student.id}...")
      IepDocument.create!(
        file_name: @file_name,
        student: @student
      )
    end
  end

end
