class BehaviorImporter

  def initialize(options:)
    @school_scope = options.fetch("school_scope")
    @log = options.fetch("log")
  end

  def import
    return unless remote_file_name

    @data = CsvDownloader.new(
      log: @log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    @data.each.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
      ProgressBar.new(log, remote_file_name, @data.size, index + 1).print if progress_bar
    end
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
    BehaviorRow.build(row).save!
  end
end
