class KippNjImporters

  attr_reader :school_scope, :first_time

  def initialize(options = {})
    @school_scope = options[:school_scope]
    @first_time = options[:first_time]
  end

  def aws_credentials
    {
      key: ENV['KIPP_NJ_AWS_KEY'],
      secret_key: ENV['KIPP_NJ_AWS_SECRET_KEY'],
      bucket_name: ENV['KIPP_NJ_AWS_BUCKET_NAME'],
      region: 'us-east-1'
    }
  end

  def options
    {
      school_scope: @school_scope,
      first_time: @first_time,
      data_transformer: JsonTransformer.new,
      client: AwsAdapter.new(credentials: aws_credentials),
      file_importers: file_importers
    }
  end

  def file_importers
    if @first_time
      [ StudentsImporter.new,
        StudentAssessmentImporter.new,
        BehaviorImporter.new,
        BulkAttendanceImporter.new ] # Use bulk attendance importer for first-time import
    else
      [ StudentsImporter.new,
        StudentAssessmentImporter.new,
        BehaviorImporter.new,
        AttendanceImporter.new ]
    end
  end

  def importer
    Importer.new(options)
  end

end
