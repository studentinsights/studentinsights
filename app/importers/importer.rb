require 'csv'

class Importer

  attr_reader     :file_importers   # File imports are classes that implement two methods:
                                    # remote_file_name => name of the remote file to import
                                    # import_row => method for importing each row

  def initialize(options = {})
    @file_importers = options[:file_importers]    # Required - array of per-file importers
    @progress_bar = options[:progress_bar]
    @log = options[:log_destination] || STDOUT
  end

  def connect_transform_import
    file_importers.each do |file_importer|
      file_name = file_importer.remote_file_name
      @log.write("\nImporting #{file_name}...")

      file = file_importer.client.read_file(file_name)
      transformer = file_importer.data_transformer
      data = transformer.transform(file)
      pre_cleanup_csv_size = transformer.pre_cleanup_csv_size

      CleanupReport.new(@log, file_name, pre_cleanup_csv_size, data.size).print

      data.each.each_with_index do |row, index|
        begin
          file_importer.import_row(row) if file_importer.filter.include?(row)
        rescue ActiveRecord::RecordInvalid => import_row_error
          @log.write("Caught exception importing a row: #{import_row_error}")
        end

        if @progress_bar == :true  # Thor passes Boolean options as Symbols :/
          ProgressBar.new(@log, file_name, data.size, index + 1).print
        end
      end
    end
  end
end
