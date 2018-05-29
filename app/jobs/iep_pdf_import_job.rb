require 'zip'
require 'tempfile'
require 'fileutils'

class IepPdfImportJob

  REQUIRED_KEYS = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_IEP_BUCKET',
  ]

  def initialize(options = {})
    raise "missing AWS keys!" if REQUIRED_KEYS.any? { |aws_key| (ENV[aws_key]).nil? }

    @time_now = options[:time_now] || Time.now
  end

  # This imports all the IEP PDFs from a zip that
  # contains several older documents (ie., for a first-time import).
  # It will fail on any errors, log to the console and won't retry.
  def bulk_import!
    remote_filenames = [ENV['BULK_IEP_IMPORT_TARGET']]

    import_ieps!(remote_filenames)
  end

  # Each ZIP file sent down from EasyIEP has a number at the end, the number
  # indicates that the ZIP contains a set of changed IEPs from `n` days ago.
  #
  # If there are no IEPs on any given day, that number may be missing from the
  # sequence.
  #
  # The most recent change set (student-documents-1.zip), is the only one we really
  # need to import, but the rest are sent down in case the import job fails
  # and we need to catch up on missed change sets.
  #
  # Order is important here.
  def nightly_import!
    remote_filenames = [
      'student-documents-6.zip',
      'student-documents-5.zip',
      'student-documents-4.zip',
      'student-documents-3.zip',
      'student-documents-2.zip',
      'student-documents-1.zip',
    ]

    import_ieps!(remote_filenames)
  end

  private

    def import_ieps!(remote_filenames)
      clean_up

      FileUtils.mkdir_p("tmp/data_download/unzipped_ieps")

      remote_filenames.each do |filename|
        zip_file = download(filename)
        log "got a zip: #{zip_file}"
        unzipped_count = 0
        FileUtils.mkdir_p("tmp/data_download/unzipped_ieps/#{filename}")

        begin
          Zip::File.open(zip_file) do |zip_file|
            zip_file.each do |entry|
              entry.extract("tmp/data_download/unzipped_ieps/#{filename}/#{entry.name}")
              unzipped_count += 1
            end
          end
        rescue => e
          log e.message
        end

        log "unzipped #{unzipped_count} date zips!"

        log "parsing unzipped pdfs from #{filename}...!"

        pdf_filenames = Dir["tmp/data_download/unzipped_ieps/#{filename}/*"]

        pdf_filenames.each do |path|
          parse_file_name_and_store_file(path)
        end
      end

      clean_up
    end

    def logger
      @iep_import_logger ||= Logger.new(STDOUT)
    end

    def log(msg)
      logger.info(msg)
    end

    def parse_file_name_and_store_file(path_to_file)
      file_info = IepFileNameParser.new(path_to_file)

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
      @client ||= Aws::S3::Client.new(region: 'us-west-2')
    end

    def download(remote_filename)
      client = SftpClient.for_x2

      begin
        client.download_file(remote_filename)
        log "downloaded a file!"
      rescue RuntimeError => error
        message = error.message

        if message.include?('no such file')
          log error.message
          log 'No file found but no worries, just means no educators added IEPs into the EasyIEP system that particular day.'
        else
          raise error
        end
      end

      return File.open("tmp/data_download/#{remote_filename}")
    end

    def clean_up
      FileUtils.rm_rf(Rails.root.join('tmp/data_download/unzipped_ieps'))
      FileUtils.rm_rf([
        Rails.root.join("tmp/data_download/#{ENV['BULK_IEP_IMPORT_TARGET']}"),
        Rails.root.join("tmp/data_download/student-documents-6.zip"),
        Rails.root.join("tmp/data_download/student-documents-5.zip"),
        Rails.root.join("tmp/data_download/student-documents-4.zip"),
        Rails.root.join("tmp/data_download/student-documents-3.zip"),
        Rails.root.join("tmp/data_download/student-documents-2.zip"),
        Rails.root.join("tmp/data_download/student-documents-1.zip"),
      ])
    end

end
