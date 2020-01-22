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
    @log = options.fetch(:log, nil)
  end

  def import
    if !PerDistrict.new.is_star_import_enabled()
      log('Aborting, is_star_import_enabled=false.')
      return
    end

    remote_file_name = PerDistrict.new.try_star_filename('FILENAME_FOR_STAR_READING_IMPORT')
    StarImporter.new(options: @options.merge({
      model_class: StarReadingResult,
      remote_file_name: remote_file_name
    })).import
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "StarReadingImporter: #{text}"
  end
end
