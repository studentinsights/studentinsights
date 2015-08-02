module Importer
  # Any class using X2Importer should implement two methods:
  # export_file_name => string pointing to the name of the remote file to parse
  # import_row => function that describes how to handle each row (implemented by handle_row)

  def initialize(options = {})
    # Required arguments
    @client = options[:client]
    @data_transformer = options[:data_transformer]

    # Optional arguments (for scoping import)
    @school = options[:school]
    @recent_only = options[:recent_only]
    @summer_school_local_ids = options[:summer_school_local_ids]    # For importing only summer school students
  end

  # SCOPED IMPORT #

  def connect_transform_import
    file = @client.read_file
    data = @data_transformer.transform(file)
    import(data)
  end

  def connect_transform_import_locally
    path = @client.file_tmp_path
    unless File.exist? path
      @client.download_file_to_tmp
    end
    file_as_string = File.open(path, "r").read
    data = @data_transformer.transform(file_as_string)
    import_locally(data)
  end

  def import(data)
    data.each do |row|
      row.length.times { row.delete(nil) }
      handle_row(row)
    end
    return data
  end

  def import_locally(data)
    # Set up for proress bar
    if Rails.env.development?
      n = 0
      progress_bar = ProgressBar.new(data.size, @client.export_file_name)
    end

    # Import
    data.each do |row|
      row.length.times { row.delete(nil) }
      handle_row(row)
      if Rails.env.development?
        n += 1
        print progress_bar.current_status(n)
      end
    end

    # Exit
    puts if Rails.env.development?
    return data
  end

  def handle_row(row)
    if @school.present?
      import_if_in_school_scope(row)
    elsif @summer_school_local_ids.present?
      import_if_in_summer_school(row)
    else
      import_row row
    end
  end

  def import_if_in_school_scope(row)
    if @school.local_id == row[:school_local_id]
      import_row row
    end
  end

  def import_if_in_summer_school(row)
    if @summer_school_local_ids.include? row[:local_id]
      import_row row
    end
  end
end
