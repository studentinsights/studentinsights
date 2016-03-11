require 'csv'

class Importer

  attr_reader     :file_importers,  # File imports are classes that implement two methods:
                                    # remote_file_name => name of the remote file to import
                                    # import_row => method for importing each row
                  :client,
                  :school_scope

  class Filter < Struct.new(:schools)
    def include?(row)
      schools.nil? || schools.include?(row[:school_local_id])
    end
  end

  def initialize(options = {})
    @client = options[:client]                    # Required - client for connecting to remote site
    @file_importers = options[:file_importers]    # Required - array of per-file importers
    @school_scope = options[:school_scope]        # Optional array of school local IDs
    @log = options[:log_destination] || STDOUT
  end

  def filter
    @filter ||= Filter.new(@school_scope)
  end

  def connect_transform_import
    file_importers.each do |file_importer|
      file = @client.read_file(file_importer.remote_file_name)

      pre_cleanup_csv = CSV.parse(file, headers: true)
      @log.write("\n\n\n#{pre_cleanup_csv.size} rows of data in #{file_importer.remote_file_name} pre-cleanup")

      data = file_importer.data_transformer.transform(file)
      @log.write("\n#{data.size} rows of data in #{file_importer.remote_file_name} post-cleanup")

      progress_bar = ProgressBar.new(data.size, file_importer.remote_file_name)

      @log.write("\n\n")

      data.each.each_with_index do |row, index|
        row.delete_if { |key, value| key.blank? }
        file_importer.import_row(row) if filter.include?(row)
        @log.print(progress_bar.current_status(index))
      end
    end
  end


  # FOR DEVELOPMENT ONLY (useful when you don't want to redownload files every time):

  # def connect_transform_import_locally
  #   file_importers.each do |file_importer|

  #     path = @client.file_tmp_path(file_importer.remote_file_name)
  #     unless File.exist? path
  #       @client.download_file_to_tmp(file_importer.remote_file_name)
  #     end

  #     file_as_string = File.read(path).encode('UTF-8',
  #                                             'binary',
  #                                             invalid: :replace,
  #                                             undef: :replace,
  #                                             replace: '')

  #     data = file_importer.data_transformer.transform(file_as_string)

  #     progress_bar = ProgressBar.new(data.size, file_importer.remote_file_name)

  #     data.each.each_with_index do |row, index|
  #       row.delete_if { |key, value| key.blank? }
  #       file_importer.import_row(row) if filter.include?(row)
  #       @log.print(progress_bar.current_status(index))
  #     end

  #   end
  # end

end
