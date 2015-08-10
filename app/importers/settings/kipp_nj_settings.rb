class Settings::KippNjSettings

  attr_reader :school_scope, :first_time, :recent_only

  def initialize(options = {})
    @school_scope = options[:school_scope]
    @first_time = options[:first_time]
    @recent_only = options[:recent_only]
  end

  def base_options
    {
      school_scope: @school_scope,
      recent_only: @recent_only,
      first_time: @first_time,
      data_transformer: JsonTransformer.new
    }
  end

  def students_options
    students_options = base_options.clone
    students_options[:client] = AwsAdapter.new({credentials: aws_credentials, remote_file_name: 'students.json'})
    return students_options
  end

  def assessment_options
    assessment_options = base_options.clone
    assessment_options[:client] = AwsAdapter.new({credentials: aws_credentials, remote_file_name: 'assess.json'})
    return assessment_options
  end

  def behavior_options
    attendance_options = base_options.clone
    attendance_options[:client] = AwsAdapter.new({credentials: aws_credentials, remote_file_name: 'disc.json'})
    return attendance_options
  end

  def attendance_options
    behavior_options = base_options.clone
    behavior_options[:client] = AwsAdapter.new({credentials: aws_credentials, remote_file_name: 'att.json'})
    return behavior_options
  end

  def configuration
    [
      StudentsImporter.new(students_options),
      X2AssessmentImporter.new(assessment_options),
      BehaviorImporter.new(behavior_options),
      AttendanceImporter.new(attendance_options)
    ]
  end

  def aws_credentials
    {
      key: ENV['KIPP_NJ_AWS_KEY'],
      secret_key: ENV['KIPP_NJ_AWS_SECRET_KEY'],
      bucket_name: ENV['KIPP_NJ_AWS_BUCKET_NAME'],
      region: 'us-east-1'
    }
  end

end
