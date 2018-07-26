class EducatorsImporter

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
  end

  def import
    return unless remote_file_name

    log('Downloading...')
    streaming_csv = CsvDownloader.new(
      log: @log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    log('Starting loop...')
    @skipped_from_school_filter = 0
    @invalid_rows_count = 0
    @touched_rows_count = 0
    @ignored_special_nil_homeroom_count = 0
    @ignored_no_homeroom_count = 0
    @ignored_unknown_homeroom_count = 0
    @touched_homeroom_count = 0
    streaming_csv.each_with_index do |row, index|
      import_row(row)
    end

    log('Done loop.')
    log("@skipped_from_school_filter: #{@skipped_from_school_filter}")
    log("@invalid_rows_count: #{@invalid_rows_count}")
    log("@touched_rows_count: #{@touched_rows_count}")
    log("@ignored_special_nil_homeroom_count: #{@ignored_special_nil_homeroom_count}")
    log("@ignored_no_homeroom_count: #{@ignored_no_homeroom_count}")
    log("@ignored_unknown_homeroom_count: #{@ignored_unknown_homeroom_count}")
    log("@touched_homeroom_count: #{@touched_homeroom_count}")
  end

  def client
    SftpClient.for_x2
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_EDUCATORS_IMPORT', nil)
  end

  def data_transformer
    StreamingCsvTransformer.new(@log)
  end

  def filter
    SchoolFilter.new(@school_scope)
  end

  def school_ids_dictionary
    @dictionary ||= School.all.map { |school| [school.local_id, school.id] }.to_h
  end

  def import_row(row)
    if !filter.include?(row[:school_local_id])
      @skipped_from_school_filter = @skipped_from_school_filter + 1
      return
    end

    maybe_educator = EducatorRow.new(row, school_ids_dictionary).build
    if maybe_educator.nil?
      @invalid_rows_count = @invalid_rows_count + 1
      return
    end
    if !maybe_educator.valid?
      @invalid_rows_count = @invalid_rows_count + 1
      return
    end
    educator = maybe_educator

    educator.save!
    @touched_rows_count = @touched_rows_count + 1

    # Special case for NB magic "nil" value
    if PerDistrict.new.is_nil_homeroom_name?(row[:homeroom])
      @ignored_special_nil_homeroom_count = @ignored_special_nil_homeroom_count + 1
      return
    end

    # No homeroom
    if !row[:homeroom]
      @ignored_no_homeroom_count = @ignored_no_homeroom_count + 1
      return
    end

    # Update homeroom
    homeroom = Homeroom.find_by_name(row[:homeroom])
    if homeroom.nil?
      @ignored_unknown_homeroom_count = @ignored_unknown_homeroom_count + 1
      return
    end
    homeroom.update!(educator: educator)
    @touched_homeroom_count = @touched_homeroom_count + 1
  end

  private
  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "EducatorsImporter: #{text}"
  end
end
