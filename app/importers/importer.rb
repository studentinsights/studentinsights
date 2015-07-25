module Importer

  def initialize(options = {})
    @school = options[:school]
    @recent_only = options[:recent_only]
    @summer_school_local_ids = options[:summer_school_local_ids]    # For importing only summer school students
  end

  # SCOPED IMPORT #

  def connect_and_import
    sftp = client.start
    file = sftp.download!(export_file_name).encode('UTF-8', 'binary', invalid: :replace, undef: :replace, replace: '')
    import(file)
  end

  def import(file)
    csv = parse_as_csv(file)

    if Rails.env.development?
      n = 0
      number_of_rows = csv.size
    end

    csv.each do |row|
      row.delete(nil)
      handle_row(row)
      if Rails.env.development?
        n += 1
        print progress_bar(n, number_of_rows)
      end
    end

    puts if Rails.env.development?
    return csv
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
