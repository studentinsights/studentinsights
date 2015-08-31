class Settings::SomervilleSettings

  def initialize(options = {})
    @school_scope = options[:school_scope]
    @first_time = options[:first_time]
    @recent_only = options[:recent_only]
  end

  def base_options
    {
      school_scope: @school_scope,
      recent_only: @recent_only,
      first_time: @first_time
    }
  end

  def x2_sftp_credentials
    {
      user: ENV['SIS_SFTP_USER'],
      host: ENV['SIS_SFTP_HOST'],
      key_data: ENV['SIS_SFTP_KEY']
    }
  end

  def star_sftp_credentials
    {
      user: ENV['STAR_SFTP_USER'],
      host: ENV['STAR_SFTP_HOST'],
      password: ENV['STAR_SFTP_PASSWORD']
    }
  end

  def students_options
    students_options = base_options.clone
    students_options[:client] = SftpClient.new({credentials: x2_sftp_credentials, remote_file_name: 'students_export.txt'})
    students_options[:data_transformer] = CsvTransformer.new
    return students_options
  end

  def assessment_options
    assessment_options = base_options.clone
    assessment_options[:client] = SftpClient.new({credentials: x2_sftp_credentials, remote_file_name: 'assessment_export.txt'})
    assessment_options[:data_transformer] = CsvTransformer.new
    return assessment_options
  end

  def star_math_options
    star_math_options = base_options.clone
    star_math_options[:client] = SftpClient.new({credentials: star_sftp_credentials, remote_file_name: 'SM.csv'})
    star_math_options[:data_transformer] = StarMathCsvTransformer.new
    return star_math_options
  end

  def star_reading_options
    star_reading_options = base_options.clone
    star_reading_options[:client] = SftpClient.new({credentials: star_sftp_credentials, remote_file_name: 'SR.csv'})
    star_reading_options[:data_transformer] = StarReadingCsvTransformer.new
    return star_reading_options
  end

  def behavior_options
    behavior_options = base_options.clone
    behavior_options[:client] = SftpClient.new({credentials: x2_sftp_credentials, remote_file_name: 'behavior_export.txt'})
    behavior_options[:data_transformer] = CsvTransformer.new
    return behavior_options
  end

  def attendance_options
    attendance_options = base_options.clone
    attendance_options[:client] = SftpClient.new({credentials: x2_sftp_credentials, remote_file_name: 'attendance_export.txt'})
    attendance_options[:data_transformer] = CsvTransformer.new
    return attendance_options
  end

  def configuration
    importers = [
      StudentsImporter.new(students_options),
      StudentAssessmentImporter.new(assessment_options),
      StarMathImporter.new(star_math_options),
      StarReadingImporter.new(star_reading_options),
      BehaviorImporter.new(behavior_options),
      HealeyAfterSchoolTutoringImporter.new   # Currently local import only
    ]

    if @first_time
      importers << BulkAttendanceImporter.new(attendance_options)
    else
      importers << AttendanceImporter.new(attendance_options)
    end
  end

end
