class FileImport < Struct.new :file_importer

  delegate :log, :remote_file_name, :client, :data_transformer,
    :import_row, :filter, :progress_bar, :delete_rows, to: :file_importer

  def import
    log_start_of_import
    fetch_data
    import_data
    delete_data if deletion_models.include?(file_importer.class)
  end

  private

  def file
    encoding_options = {
      invalid: :replace,
      undef: :replace,
      replace: ''
    }

    downloaded_file = client.download_file(remote_file_name)

    File.read(downloaded_file).encode('UTF-8', 'binary', encoding_options)
  end

  def log_start_of_import
    log.write("\nImporting #{remote_file_name}...")
  end

  def delete_data
    delete_rows()
  end

  def deletion_models
    [StudentSectionAssignmentsImporter,
    EducatorSectionAssignmentsImporter]
  end

  def fetch_data
    transformer = data_transformer
    @data = transformer.transform(file)
    pre_cleanup_csv_size = transformer.pre_cleanup_csv_size
    CleanupReport.new(log, remote_file_name, pre_cleanup_csv_size, @data.size).print
  end

  def import_data
    @data.each.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
      ProgressBar.new(log, remote_file_name, @data.size, index + 1).print if progress_bar
    end
  end

end
