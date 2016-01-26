class Importer

  attr_reader     :file_importers,  # File imports are classes that implement two methods:
                                    # remote_file_name => name of the remote file to import
                                    # import_row => method for importing each row
                  :client,
                  :school_scope,
                  :recent_only,
                  :first_time

  attr_accessor   :current_file_importer

  def initialize(options = {})
    # Required
    @file_importers = options[:file_importers]
    @client = options[:client]

    # Optional
    @school_scope = options[:school_scope]
    @recent_only = options[:recent_only]
    @first_time = options[:first_time]

    # Just for testing convenience, otherwise set internally
    @current_file_importer = options[:current_file_importer]
  end

  def connect_transform_import
    file_importers.each do |file_importer|
      @current_file_importer = file_importer
      file = @client.read_file(file_importer.remote_file_name)
      data = file_importer.data_transformer.transform(file)
      start_import(data)
    end
  end

  def start_import(data)
    # Set up progress bar
    puts; n = 0; progress_bar = ProgressBar.new(data.size, @current_file_importer.remote_file_name)

    data.each do |row|
      row.delete_if { |key, value| key.blank? }
      check_scope_and_import_row(row)
      n += 1; print progress_bar.current_status(n)
    end
  end

  def check_scope_and_import_row(row)
    return check_elementary_scope(row) if @school_scope == 'ELEM'
    return check_school_scope(row) if @school_scope.present?
    @current_file_importer.import_row(row)
  end

  def check_elementary_scope(row)
    somerville_elementary_school_local_ids = [
      "BRN", "HEA", "KDY", "AFAS", "ESCS", "WSNS", "WHCS"
    ]

    return if somerville_elementary_school_local_ids.exclude? row[:school_local_id]
    @current_file_importer.import_row(row)
  end

  def check_school_scope(row)
    return if @school_scope != row[:school_local_id]
    @current_file_importer.import_row(row)
  end

  # FOR DEVELOPMENT ONLY (useful when you don't want to redownload files every time):

  # def connect_transform_import_locally
  #   file_importers.each do |file_importer|

  #     @current_file_importer = file_importer

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
  #     start_import(data)
  #   end
  # end

end
