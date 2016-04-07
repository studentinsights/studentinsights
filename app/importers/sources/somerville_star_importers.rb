class SomervilleStarImporters
  def self.from_options(options)
    new(options).importer
  end

  def initialize(options = {})
    @school_scope = options["school"]
    @log = options["test_mode"] ? LogHelper::Redirect.instance.file : STDOUT
  end

  def options
    {
      client: SftpClient.for_star,
      data_transformer: CsvTransformer.new,
      file_importers: file_importers,
      log_destination: @log
    }
  end

  def sftp_client
    @client ||= SftpClient.for_star
  end

  def file_importers
    [
      StarReadingImporter,
      StarReadingImporter::HistoricalImporter,
      StarMathImporter,
      StarMathImporter::HistoricalImporter
    ].map { |i| i.new(@school_scope, sftp_client) }
  end

  def importer
    [Importer.new(options)]
  end

end
