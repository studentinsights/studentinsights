class SomervilleStarImporters

  def initialize(options = {})
    @school_scope = options[:school_scope]
    @first_time = options[:first_time]
    @recent_only = options[:recent_only]
  end

  def sftp_credentials
    {
      user: ENV['STAR_SFTP_USER'],
      host: ENV['STAR_SFTP_HOST'],
      password: ENV['STAR_SFTP_PASSWORD']
    }
  end

  def options
    {
      school_scope: @school_scope,
      recent_only: @recent_only,
      first_time: @first_time,
      client: SftpClient.new(credentials: sftp_credentials),
      data_transformer: CsvTransformer.new,
      file_importers: [
        StarReadingImporter.new,
        StarReadingImporter::HistoricalImporter.new,
        StarMathImporter.new,
        StarMathImporter::HistoricalImporter.new
      ]
    }
  end

  def importer
    Importer.new(options)
  end

end
