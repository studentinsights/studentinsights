class SomervilleStarImporters

  def initialize(options = {})
    @school_scope = options["school"]
    @progress_bar = options["progress_bar"]
    @log = options["test_mode"] ? File.new(LogHelper.path, 'w') : STDOUT
  end

  def sftp_client
    @client ||= SftpClient.for_star
  end

  def file_importer_classes
    [
      StarReadingImporter,
      StarReadingImporter::HistoricalImporter,
      StarMathImporter,
      StarMathImporter::HistoricalImporter
    ]
  end

  def file_importers
    file_importer_classes.map do |file_importer_class|
      file_importer_class.new(@school_scope, sftp_client, @log, @progress_bar)
    end
  end

end
