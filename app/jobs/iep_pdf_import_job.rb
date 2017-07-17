require 'zip'
require 'tempfile'
require 'fileutils'

class IepPdfImportJob
  def initialize(options = {})
    @time_now = options[:time_now] || Time.now
  end

  class IepStorer
    def initialize(file_name:, path_to_file:, file_date:, local_id:)
      @file_name = file_name
      @path_to_file = path_to_file
      @file_date = file_date
      @local_id = local_id
    end

    def store
      student = Student.find_by_local_id(record[:local_id])

      log "student not in db!" && return unless student

      log "storing iep for student to db."

      s3.put_object(
        bucket: ENV['AWS_S3_IEP_BUCKET'],
        key: @file_name,
        body: File.open(@path_to_file)
      )

      IepDocument.create!(
        file_date: @file_date,
        file_name: @path_to_file,
        student: @student
      )
    end
  end

  REMOTE_FILENAME = 'student-documents_old.zip'

  # This imports all the IEP PDFs from a zip that
  # contains several older documents (ie., for a first-time import).
  #
  # It will fail on any errors, log to the console and won't retry.
  def bulk_import!
    # pull down the file to heroku dyno
    zip_file = download(REMOTE_FILENAME)
    log "got a zip: #{zip_file.path}"

    date_zip_folder = make_folder_for_zipped_files

    log 'unzipping date bundles...'
    date_zip_filenames = unzip_to_folder(zip_file, date_zip_folder)

    log "got #{date_zip_filenames.size} date zips!"
    filename_pairs = []
    date_zip_filenames.each do |date_zip_filename|
      folder = File.join(date_zip_filename + '.unzipped')
      FileUtils.mkdir_p(folder)
      date_zip = File.open(date_zip_filename)

      pdf_filenames = unzip_to_folder(date_zip, folder)

      pdf_filenames.each do |pdf_filename|
        filename_pairs << {
          pdf_filename: pdf_filename.split("/").last,
          date_zip_filename: date_zip_filename,
          path_to_file: pdf_filename
        }
      end

      date_zip.close
    end

    records = []
    filename_pairs.map do |pair|
      pdf_filename = pair[:pdf_filename]
      pdf_basename = Pathname.new(pdf_filename).basename.sub_ext('').to_s
      local_id, iep_at_a_glance, *student_names = pdf_basename.split('_')
      raise 'oh no!' if iep_at_a_glance != 'IEPAtAGlance'

      date_zip_filename = pair[:date_zip_filename]
      date_zip_basename = Pathname.new(date_zip_filename).basename.sub_ext('').to_s
      date = Date.strptime(date_zip_basename, '%m-%d-%Y')

      records << {
        local_id: local_id,
        pdf_filename: pdf_filename,
        date: date.to_s,
        path_to_file: pair[:path_to_file]
      }
    end

    records.map do |record|
      IepStorer.new(
        file_name: record[:pdf_filename],
        path_to_file: record[:path_to_file],
        file_date: record[:date],
        local_id: record[:local_id]
      ).store
    end

    delete_folder_for_zipped_files
  end

  def nightly_import!
    # TODO
  end

  private

    def log(str)
      puts str
    end

    def s3
      @client ||= Aws::S3::Client.new
    end

    def download(remote_filename)
      local_file = Tempfile.new('iep_pdf_zip')
      client = SftpClient.for_x2
      log "have a client!"
      client.sftp_session.download!(remote_filename, local_file.path)
      log "downloaded a file!"

      return local_file
    end

    def unzip_to_folder(zip_file, target_folder)
      output_filenames = []
      Zip::File.open(zip_file) do |files_in_zip|
        files_in_zip.each do |file_in_zip|
          output_filename = File.join(target_folder, file_in_zip.name)
          files_in_zip.extract(file_in_zip, output_filename)
          output_filenames << output_filename
        end
      end
      output_filenames
    end

    def make_folder_for_zipped_files
      date_zip_folder = Rails.root.join('tmp/iep_pdfs/date_zips')
      FileUtils.mkdir_p(date_zip_folder)

      return date_zip_folder
    end

    def delete_folder_for_zipped_files
      date_zip_folder = Rails.root.join('tmp/iep_pdfs')

      FileUtils.rm_rf(date_zip_folder)
    end

end
