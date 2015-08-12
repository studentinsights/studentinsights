module Importer
  # Any class using X2Importer should implement two methods:
  # remote_file_name => string pointing to the name of the remote file to parse
  # import_row => function that describes how to handle each row (implemented by handle_row)

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
      progress_bar = ProgressBar.new(data.size, @client.remote_file_name)
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
