class StudentsImporter

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
  end

  def import
    return unless remote_file_name

    @data = CsvDownloader.new(
      log: @log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    @data.each_with_index do |row, index|
      import_row(row) if filter.include?(row[:school_local_id])
    end
  end

  def client
    SftpClient.for_x2
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_STUDENTS_IMPORT', nil)
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
    student = StudentRow.new(row, school_ids_dictionary, @log).build
    return nil if student.registration_date_in_future
    return student unless student.changed?

    did_save = student.save
    if !did_save
      @log.puts(error_message(student))
      return nil
    end

    return student
  end

  private
  def error_message(student)
    "StudentsImporter: could not save student record because of errors on #{student.errors.keys}"
  end

end
