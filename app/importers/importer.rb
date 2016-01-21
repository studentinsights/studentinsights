module Importer
  # Any class that includes this module must implement these two methods:
  # remote_file_name => string pointing to the name of the remote file to parse
  # import_row => function that describes how to handle each row (called by handle_row)

  attr_reader :client, :data_transformer, :school_scope, :recent_only, :first_time

  def initialize(options = {})
    # Required arguments
    @client = options[:client]
    @data_transformer = options[:data_transformer] || data_transformer

    # Optional arguments
    @school_scope = options[:school_scope]
    @recent_only = options[:recent_only]
    @first_time = options[:first_time]
  end

  def connect_transform_import
    file = @client.read_file(remote_file_name)
    data = @data_transformer.transform(file)
    import(data)
  end

  def connect_transform_import_locally
    path = @client.file_tmp_path(remote_file_name)
    unless File.exist? path
      @client.download_file_to_tmp(remote_file_name)
    end
    file_as_string = File.read(path).encode('UTF-8', 'binary', invalid: :replace, undef: :replace, replace: '')
    data = @data_transformer.transform(file_as_string)
    import(data)
  end

  def import(data)
    # Set up progress bar
    puts; n = 0; progress_bar = ProgressBar.new(data.size, remote_file_name)

    data.each do |row|
      row.delete_if { |key, value| key.blank? }
      check_scope_and_import_row(row)
      n += 1; print progress_bar.current_status(n)
    end
  end

  def check_scope_and_import_row(row)
    return check_elementary_scope(row) if @school_scope == 'ELEM'
    return check_school_scope(row) if @school_scope.present?
    import_row(row)
  end

  SOMERVILLE_ELEMENTARY_SCHOOL_LOCAL_IDS = ["BRN", "HEA", "KDY", "AFAS", "ESCS", "WSNS", "WHCS"]

  def check_elementary_scope(row)
    return if SOMERVILLE_ELEMENTARY_SCHOOL_LOCAL_IDS.exclude? row[:school_local_id]
    import_row(row)
  end

  def check_school_scope(row)
    return if @school_scope != row[:school_local_id]
    import_row(row)
  end

end
