class StarMathImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_STAR_VENDOR_SFTP_CSV,
      frequency: DataFlow::FREQUENCY_DAILY,
      merge: DataFlow::MERGE_UPDATE_IGNORE_UNMARKED,
      options: [DataFlow::OPTION_SCHOOL_SCOPE],
      touches: [
        StarMathResult.name
      ],
      description: 'STAR Math scores, imported from vendor'
    })
  end

  def initialize(options:)
    @options = options
    @log = options.fetch(:log, nil)
  end

  def import
    remote_file_name = PerDistrict.new.try_star_filename('FILENAME_FOR_STAR_MATH_IMPORT')
    if remote_file_name.nil?
      log('Aborting, no remote_file_name.')
      return
    end

    StarImporter.new(options: @options.merge({
      model_class: StarMathResult,
      remote_file_name: remote_file_name
    })).import
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "StarMathImporter: #{text}"
  end
end
