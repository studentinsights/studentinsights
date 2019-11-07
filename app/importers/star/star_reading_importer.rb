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
    @options = options
  end

  def import
    remote_file_name = PerDistrict.new.try_star_filename('FILENAME_FOR_STAR_READING_IMPORT')
    if remote_file_name.nil?
      log('Aborting, no remote_file_name.')
      return
    end

    StarImporter.new(options: @options.merge({
      model_class: StarReadingResult,
      remote_file_name: remote_file_name
    })).import
  end
end
