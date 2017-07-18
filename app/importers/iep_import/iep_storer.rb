class IepStorer
  def initialize(file_name:,
                 path_to_file:,
                 file_date:,
                 local_id:,
                 client:)
    @file_name = file_name
    @path_to_file = path_to_file
    @file_date = file_date
    @local_id = local_id
    @client = client
  end

  def store
    student = Student.find_by_local_id(@local_id)

    log "student not in db!" && return unless student

    log "storing iep for student to db."

    @client.put_object(
      bucket: ENV['AWS_S3_IEP_BUCKET'],
      key: @file_name,
      body: File.open(@path_to_file),
      server_side_encryption: 'AES256'
    )

    IepDocument.create!(
      file_date: @file_date,
      file_name: @path_to_file,
      student: @student
    )
  end

  private

    def log(str)
      puts str
    end

end
