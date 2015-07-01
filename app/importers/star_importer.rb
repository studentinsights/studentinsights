module StarImporter
  include Importer
  # Any class using StarImporter should implement two methods:
  # export_file_name => string pointing to the name of the remote file to parse
  # header_converters => function that describes how to convert the headers on the remote files

  attr_accessor :school, :summer_school_local_ids, :recent_only

  def initialize(options = {})
    @school = options[:school]
    @recent_only = options[:recent_only]
    @summer_school_local_ids = options[:summer_school_local_ids]    # For importing only summer school students
  end

  def sftp_info_present?
    ENV['STAR_SFTP_HOST'].present? &&
    ENV['STAR_SFTP_USER'].present? &&
    ENV['STAR_SFTP_PASSWORD'].present?
  end

  def connect_and_import
    if sftp_info_present?
      Net::SFTP.start(
        ENV['STAR_SFTP_HOST'],
        ENV['STAR_SFTP_USER'],
        password: ENV['STAR_SFTP_PASSWORD']
        ) do |sftp|
        # For documentation on Net::SFTP::Operations::File, see
        # http://net-ssh.github.io/sftp/v2/api/classes/Net/SFTP/Operations/File.html
        file = sftp.download!(export_file_name)
        import(file)
      end
    else
      raise "SFTP information missing"
    end
  end

  def import(file)
    require 'csv'
    csv = CSV.new(file, headers: true, header_converters: lambda { |h| convert_headers(h) })
    number_of_rows, n = count_number_of_rows(file), 0 if Rails.env.development?
    csv.each do |row|
      row.length.times { row.delete(nil) }
      if @school.present?
        import_if_in_school_scope(row)
      elsif @summer_school_local_ids.present?
        import_if_in_summer_school(row)
      else
        import_row row
      end
      n += 1 if Rails.env.development?
      print progress_bar(n, number_of_rows) if Rails.env.development?
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
