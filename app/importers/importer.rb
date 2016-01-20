module Importer
  # Any class this module must implement these two methods:
  # remote_file_name => string pointing to the name of the remote file to parse
  # import_row => function that describes how to handle each row (implemented by handle_row)

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
    # Set up for progress bar
    n = 0; progress_bar = ProgressBar.new(data.size, remote_file_name)

    # Import
    data.each do |row|
      row.delete_if { |key, value| key.empty? }
      handle_row(row)
      n += 1; print progress_bar.current_status(n)
    end

    # Exit
    puts; return data
  end

  def handle_row(row)
    if @school_scope.present?
      import_if_in_school_scope(row)
    elsif @summer_school_local_ids.present?
      import_if_in_summer_school(row)
    else
      import_row row
    end
  end

  def import_if_in_school_scope(row)
    if @school_scope.local_id == row[:school_local_id]
      import_row row
    end
  end

  def import_if_in_summer_school(row)
    if @summer_school_local_ids.include? row[:local_id]
      import_row row
    end
  end

end
