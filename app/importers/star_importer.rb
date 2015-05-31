module StarImporter
  # Any class using StarImporter should implement two methods:
  # export_file_name => string pointing to the name of the remote file to parse
  # header_converters => function that describes how to convert the headers on the remote files

  attr_accessor :school

  def initialize(options = {})
    @school = options[:school]
  end

  def sftp_info_present?
    ENV['STAR_SFTP_HOST'].present? &&
    ENV['STAR_SFTP_USER'].present? &&
    ENV['STAR_SFTP_PASSWORD'].present?
  end

  def connect_to_star_and_import
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
    csv.each do |row|
      if @school.present?
        import_if_in_school_scope(row)
      else
        import_row row
      end
    end
    return csv
  end

  def convert_headers(header)
    if header_dictionary.keys.include? header
      header = header_dictionary[header]
    end
  end

  def import_if_in_school_scope(row)
    if @school.local_id == row[:school_local_id]
      import_row row
    end
  end

  def import_row(row)
    state_id, date_taken = row[:state_id], row[:date_taken]
    student = Student.where(state_id: state_id).first_or_create!
    star_result = StarResult.where(student_id: student.id, date_taken: date_taken).first_or_create!
    star_result_info = Hash[row].except(:state_id)
    star_result.update_attributes(star_result_info)
  end
end
