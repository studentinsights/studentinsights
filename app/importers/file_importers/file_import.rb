class FileImport < Struct.new :file_importer

  delegate :log, :remote_file_name, :client, :data_transformer,
    :import_row, :filter, :progress_bar, to: :file_importer

  def import
    log.write("\nImporting #{remote_file_name}...")

    file = client.read_file(remote_file_name)
    transformer = data_transformer
    data = transformer.transform(file)
    pre_cleanup_csv_size = transformer.pre_cleanup_csv_size

    CleanupReport.new(log, remote_file_name, pre_cleanup_csv_size, data.size).print

    data.each.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
      ProgressBar.new(log, remote_file_name, data.size, index + 1).print if progress_bar
    end
  end

end
