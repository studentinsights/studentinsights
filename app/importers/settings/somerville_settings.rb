class Settings::SomervilleSettings

  def initialize(options = {})
    @school_scope = options[:school_scope]
    @first_time = options[:first_time]
    @recent_only = options[:recent_only]
  end

  def options
    {
      school_scope: @school_scope,
      recent_only: @recent_only,
      first_time: @first_time,
      client: SftpClient.new(credentials: x2_sftp_credentials),
      data_transformer: CsvTransformer.new
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

  def configuration
    importers = [
      StudentsImporter.new(options),
      StudentAssessmentImporter.new(options),
      StarMathImporter.new(options),
      StarReadingImporter.new(options),
      BehaviorImporter.new(options),
      HealeyAfterSchoolTutoringImporter.new   # Currently local import only
      EducatorsImporter.new(options)
    ]

    if @first_time
      importers << BulkAttendanceImporter.new(options)
    else
      importers << AttendanceImporter.new(options)
    end

    importers
  end

end
