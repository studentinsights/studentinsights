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
    }
  end

  def x2_sftp_credentials
    {
      user: ENV['SIS_SFTP_USER'],
      host: ENV['SIS_SFTP_HOST'],
      key_data: ENV['SIS_SFTP_KEY']
    }
  end

  def x2_options
    options.merge({
      client: SftpClient.new(credentials: x2_sftp_credentials),
      data_transformer: CsvTransformer.new
    })
  end

  def star_sftp_credentials
    {
      user: ENV['STAR_SFTP_USER'],
      host: ENV['STAR_SFTP_HOST'],
      password: ENV['STAR_SFTP_PASSWORD']
    }
  end

  def star_options
    options.merge({ client: SftpClient.new(credentials: star_sftp_credentials) })
  end

  def x2_importers
    importers = [
      StudentsImporter.new(x2_options),
      StudentAssessmentImporter.new(x2_options),
      BehaviorImporter.new(x2_options),
      EducatorsImporter.new(x2_options),
    ]

    if @first_time
      importers << BulkAttendanceImporter.new(x2_options)
    else
      importers << AttendanceImporter.new(x2_options)
    end
  end

  def star_importers
    [
      StarReadingImporter.new(star_options),
      StarReadingImporter::HistoricalImporter.new(star_options),
      StarMathImporter.new(star_options),
      StarMathImporter::HistoricalImporter.new(star_options),
    ]
  end

  def local_importers
    return [] unless HealeyAfterSchoolTutoringImporter.files_exist?
    [HealeyAfterSchoolTutoringImporter.new]
  end

  def configuration
    # Important for X2 importers to come first since they are the sole source of truth about students.
    # STAR importers don't import students, they only import STAR results.
    # If STAR importers run first, they won't have students to update STAR results for (at least the first time around).

    return x2_importers + star_importers + local_importers if Rails.env.development?
    return x2_importers + star_importers
  end

end
