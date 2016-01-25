class SomervilleX2Importers

  def initialize(options = {})
    @school_scope = options[:school_scope]
    @first_time = options[:first_time]
    @recent_only = options[:recent_only]
  end

  def sftp_credentials
    {
      user: ENV['SIS_SFTP_USER'],
      host: ENV['SIS_SFTP_HOST'],
      key_data: ENV['SIS_SFTP_KEY']
    }
  end

  def base_options
    {
      school_scope: @school_scope,
      recent_only: @recent_only,
      first_time: @first_time,
      client: SftpClient.new(credentials: sftp_credentials)
    }
  end

  def file_importers
    [
      StudentsImporter.new,
      StudentAssessmentImporter.new,
      BehaviorImporter.new,
      EducatorsImporter.new,
    ]
  end

  def file_importers_plus_attendance
    file_importers << AttendanceImporter.new
  end

  def importer
    unless @first_time
      Importer.new(base_options.merge({file_importers: file_importers_plus_attendance}))
    else
      [
        Importer.new(base_options.merge({file_importers: file_importers})),
        BulkAttendanceImporter.new(base_options)
      ]
    end
  end

end
