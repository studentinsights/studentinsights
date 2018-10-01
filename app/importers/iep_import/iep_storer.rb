class IepStorer
  # No authorization check here
  def self.unsafe_read_bytes_from_s3(s3_client, iep_document)
    if ENV['USE_PLACEHOLDER_IEP_DOCUMENT']
      return File.read("#{Rails.root}/public/demo-blank-iep.pdf")
    end

<<<<<<< HEAD
    # Read the new location, falling back to the old if it isn't set
    s3_filename = iep_document.s3_filename || iep_document.file_name
=======
    s3_filename = iep_document.file_name
>>>>>>> origin/master
    object = s3_client.get_object({
      key: s3_filename,
      bucket: ENV['AWS_S3_PHOTOS_BUCKET']
    })
    object.body.read
  end

  def initialize(options = {})
    @path_to_file = options[:path_to_file]
    @s3_client = options[:s3_client]
    @logger = options[:logger]
    @time_now = options.fetch(:time_now, Time.now)
  end

  # On success, stores in S3 and creates a new IepDocument, returning it.
  # Returns nil if we already have this file or on error writing to S3
  # we can't control.  Logs messages for success or different error cases.
  def store_only_new
    # Parse filename
    student_local_id = parse_student_id_from_filename
    if student_local_id.nil?
      log('filename could not be parsed, dropping the IEP PDF file...')
      return nil
    end

    # Match to student
    student = Student.find_by_local_id(student_local_id)
    if student.nil?
      log('student local_id: #{student_local_id} not found, dropping the IEP PDF file...')
      return nil
    end

    # Digest file and check if we already have it
    return nil if iep_pdf_already_exists?(student)

    # Then store it in S3
    s3_filename = store_object_in_s3(student_local_id)
    return nil if s3_filename.nil?

    # And add a record referencing it in the database
    create_iep_document_record(student, s3_filename)
  end

  private
  def parse_student_id_from_filename
    iep_file_basename = Pathname.new(@path_to_file).basename.to_s
    IepDocument.parse_local_id(iep_file_basename)
  end

  def iep_pdf_already_exists?(student)
    IepDocument.find_by(file_digest: file_digest, student_id: student.id).present?
  end

  # Returns filename on success, nil on error
  def store_object_in_s3(student_local_id)
    log("storing iep pdf for student_local_id:#{student_local_id} in s3...")

    # s3 filenames are sorted by student / upload date / iep
    # Filename shape: {64-character hash} / {YYYY}-{MM}-{DD} / {64-character hash}.
    s3_filename = [
      'iep_pdfs',
      Digest::SHA256.hexdigest(student_local_id),
      @time_now.strftime('%Y-%m-%d'),
      file_digest
    ].join('/')

    response = @s3_client.put_object(
      bucket: ENV['AWS_S3_IEP_BUCKET'],
      key: s3_filename,
      body: File.open(@path_to_file),
      server_side_encryption: 'AES256'
    )

    if response
      @logger.info("    successfully stored to s3!")
      @logger.info("    encrypted with: #{response[:server_side_encryption]}")
      s3_filename
    else
      @logger.error("    error storing file in s3")
      nil
    end
  end

  def create_iep_document_record(student, s3_filename)
    iep_document = IepDocument.new(
      student_id: student.id,
      file_digest: file_digest,
      file_size: file_size,
      s3_filename: s3_filename
    )

    begin
      iep_document.save!
      iep_document
    rescue => error
      @logger.error("    🚨  🚨  🚨  Error! #{error}")
      @logger.error("    could not create IepDocument record for student_id: ##{student.id}...")
      @logger.error("    orphan file up in S3: #{s3_filename}")
      @logger.error("    IepDocument model errors: #{iep_document.errors.try(:details).try(:keys).inspect}")
      Rollbar.error('IepStorer#create_iep_document_record', error, { student_id: student.id })
      nil
    end
  end

  def file_digest
    @file_digest ||= Digest::SHA256.file(@path_to_file).to_s
  end

  def file_size
    @file_size ||= File.size(@path_to_file) # bytes
  end

  def log(msg)
    @logger.info(msg)
  end
end
