module StarImporter
  include Importer
  include ProgressBar
  require 'csv'

  # Any class using StarImporter should implement two methods:
  # export_file_name => string pointing to the name of the remote file to parse
  # header_converters => function that describes how to convert the headers on the remote files

  attr_accessor :school, :summer_school_local_ids, :recent_only

  def client
    SftpClient.new({
      user: ENV['STAR_SFTP_USER'],
      host: ENV['STAR_SFTP_HOST'],
      password: ENV['STAR_SFTP_PASSWORD']
    })
  end

  def parse_as_csv(file)
    CSV.parse(file, headers: true, header_converters: lambda { |h| convert_headers(h) })
  end

  def import(file)
    csv = parse_as_csv(file)

    if Rails.env.development?
      n = 0
      number_of_rows = csv.size
    end

    csv.each do |row|
      row.length.times { row.delete(nil) }
      handle_row(row)
      if Rails.env.development?
        n += 1
        print progress_bar(n, number_of_rows)
      end
    end

    puts if Rails.env.development?
    return csv
  end

  def convert_headers(header)
    if header_dictionary.keys.include? header
      header = header_dictionary[header]
    end
  end

  def import_row(row)
    state_id = row[:state_id]
    date_taken = Date.strptime(row[:date_taken].split(' ')[0], "%m/%d/%Y")
    student = Student.where(state_id: state_id).first_or_create!
    star_result = StarResult.where(student_id: student.id, date_taken: date_taken).first_or_create!
    star_result_info = Hash[row].except(:state_id, :school_local_id, :date_taken, :local_id)
    star_result.update_attributes(star_result_info)
  end
end
