class StarReadingImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_STAR_VENDOR_SFTP_CSV,
      frequency: DataFlow::FREQUENCY_DAILY,
      merge: DataFlow::MERGE_UPDATE_IGNORE_UNMARKED,
      options: [DataFlow::OPTION_SCHOOL_SCOPE],
      touches: [
        StarReadingResult.name
      ],
      description: 'STAR Reading scores, imported from vendor'
    })
  end

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
    remote_file_name = PerDistrict.new.try_star_filename('FILENAME_FOR_STAR_READING_IMPORT')
    @star_importer = StarImporter.new(options: options.merge({
      model_class: StarReadingResult,
      remote_file_name: remote_file_name
    }))
  end

  def import
    @star_importer.import
  end
end
