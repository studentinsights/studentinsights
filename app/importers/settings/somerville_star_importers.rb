class SomervilleStarImporters
  def self.from_options(options)
    new(options).importer
  end

  def initialize(options = {})
    @school_scope = options["school"]
  end

  def options
    {
      school_scope: @school_scope,
      client: SftpClient.for_star,
      data_transformer: CsvTransformer.new,
      file_importers: [
        StarReadingImporter,
        StarReadingImporter::HistoricalImporter,
        StarMathImporter,
        StarMathImporter::HistoricalImporter
      ].map(&:new)
    }
  end

  def importer
    [Importer.new(options)]
  end

end
