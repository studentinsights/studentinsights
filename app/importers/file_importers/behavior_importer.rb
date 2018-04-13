class BehaviorImporter

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
  end

  def import
    return unless remote_file_name

    @data = CsvDownloader.new(
      log: @log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    @success_count = 0
    @error_list = []

    @data.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
      @log.write("processed ${index} rows.") if index % 1000
    end

    @log.write("\r#{@success_count} valid rows imported, #{@error_list.size} invalid rows skipped\n")
    @error_summary = @error_list.each_with_object(Hash.new(0)) do |error, memo|
      memo[error] += 1
    end
    @log.write("\n\nBehaviorImporter: Invalid rows summary: ")
    @log.write(@error_summary)
  end

  def client
    SftpClient.for_x2
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_BEHAVIOR_IMPORT', nil)
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(@school_scope)
  end

  def import_row(row)
    behavior_event = BehaviorRow.build(row)

    if behavior_event.valid?
      behavior_event.save!
      @success_count += 1
    else
      @error_list << behavior_event.errors.messages
    end
  end
end
