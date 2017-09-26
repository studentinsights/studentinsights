require 'zip'
require 'tempfile'
require 'fileutils'

class IepPdfImportJob
  def initialize(options = {})
    @time_now = options[:time_now] || Time.now
  end

  # This imports all the IEP PDFs from a zip that
  # contains several older documents (ie., for a first-time import).
  # It will fail on any errors, log to the console and won't retry.
  def bulk_import!
    remote_filenames = ['student-documents_old.zip']

    import_ieps!(remote_filenames)
  end

  def nightly_import!
    remote_filenames = [
      'student-documents-1.zip',
      'student-documents-2.zip',
      'student-documents-3.zip',
      'student-documents-4.zip',
      'student-documents-5.zip',
      'student-documents-6.zip',
    ]

    import_ieps!(remote_filenames)
  end

  private

    def import_ieps!(remote_filenames)
      date_zip_folder = make_top_level_folder

      remote_filenames.each do |filename|
        zip_file = download(filename)
        log "got a zip: #{zip_file.path}"

        date_zip_filenames = unzip_to_folder(zip_file, date_zip_folder)
        log "unzipped #{date_zip_filenames.size} date zips!"

        date_zip_filenames.each do |date_zip_filename|
          folder = make_folder_for_unzipped_file(date_zip_filename)

          date_zip = File.open(date_zip_filename)
          pdf_filenames = unzip_to_folder(date_zip, folder)

          pdf_filenames.each do |path|
            parse_file_name_and_store_file(path, date_zip_filename)
          end
        end

        date_zip.close
      end

      delete_folder_for_zipped_files
    end

    def logger
      @iep_import_logger ||= Logger.new(STDOUT)
    end

    def log(msg)
      logger.info(msg)
    end

    def parse_file_name_and_store_file(path_to_file, date_zip_filename)
      file_info = IepFileNameParser.new(path_to_file, date_zip_filename)
      file_info.check_iep_at_a_glance

      IepStorer.new(
        path_to_file: path_to_file,
        file_name: file_info.file_name,
        local_id: file_info.local_id,
        client: s3,
        logger: logger
      ).store
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

    def make_top_level_folder
      date_zip_folder = Rails.root.join('tmp/iep_pdfs/date_zips')
      FileUtils.mkdir_p(date_zip_folder)

      return date_zip_folder
    end

    def make_folder_for_unzipped_file(date_zip_filename)
      folder = File.join(date_zip_filename + '.unzipped')
      FileUtils.mkdir_p(folder)

      return folder
    end

    def delete_folder_for_zipped_files
      date_zip_folder = Rails.root.join('tmp/iep_pdfs')

      FileUtils.rm_rf(date_zip_folder)
    end

end
