module X2Importer
  # Any class using X2Importer should implement two methods:
  # export_file_name => string pointing to the name of the remote file to parse
  # import_row => function that describes how to handle each row; takes row as only argument

  attr_accessor :school

  def initialize(options = {})
    @school = options[:school]
  end

  def sftp_info_present?
    ENV['SIS_SFTP_HOST'].present? &&
    ENV['SIS_SFTP_USER'].present? &&
    ENV['SIS_SFTP_KEY'].present?
  end

  def connect_and_import
    if sftp_info_present?
      Net::SFTP.start(
        ENV['SIS_SFTP_HOST'],
        ENV['SIS_SFTP_USER'],
        key_data: ENV['SIS_SFTP_KEY'],
        keys_only: true,
        ) do |sftp|
        # For documentation see https://net-ssh.github.io/sftp/v2/api/
        file = sftp.download!(export_file_name)
        import(file)
      end
    else
      raise "SFTP information missing"
    end
  end

  def import(file)
    require 'csv'
    csv = CSV.new(file, headers: true, header_converters: :symbol)
    n = 0
    number_of_rows = count_number_of_rows(file)

    csv.each do |row|
      if @school.present?
        import_if_in_school_scope(row)
      else
        import_row row
      end
      print progress_bar(n, number_of_rows) if Rails.env.development?
      n += 1
    end
    return csv
  end

  def import_if_in_school_scope(row)
    if @school.local_id == row[:school_local_id]
      import_row row
    end
  end

  def count_number_of_rows(file)
    row_count = 0
    while file.gets do row_count += 1 end
    return row_count - 100    # Don't count headers
  end

  def progress_bar(n, length)
    fractional_progress = (n.to_f / length.to_f)
    percentage_progress = (fractional_progress * 100).to_i.to_s + "%"

    line_fill_part, line_empty_part = "", ""
    line_progress = (fractional_progress * 40).to_i

    line_progress.times { line_fill_part += "=" }
    (40 - line_progress).times { line_empty_part += " " }

    return "\r #{export_file_name} [#{line_filled_in}#{line_empty}] #{percentage} (#{n} out of #{length})"
  end
end
