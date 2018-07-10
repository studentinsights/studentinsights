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
    remote_filenames = [ENV.fetch('BULK_IEP_IMPORT_TARGET')]

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
    import_ieps!(PerDistrict.new.filenames_for_iep_pdf_zips)
  end

  private

    def import_ieps!(remote_filenames)
      clean_up
      FileUtils.mkdir_p(absolute_local_download_path)

      all_pdf_filenames = []
      all_iep_documents = []

      remote_filenames.each do |filename|
        zip_file = download(filename)
        next if zip_file.nil?

        log "got a zip from: #{filename}"
        unzipped_count = 0
        FileUtils.mkdir_p(File.join(absolute_local_download_path, filename))

        begin
          Zip::File.open(zip_file) do |zip_object|
            zip_object.each do |entry|
              entry.extract(File.join(absolute_local_download_path, filename, entry.name))
              unzipped_count += 1
            end
          end
        rescue => e
          log e.message
        end

        log "unzipped #{unzipped_count} files from #{filename}, parsing those unzipped pdfs..."

        pdf_filenames = Dir[File.join(absolute_local_download_path, filename, '*')]

        iep_documents = pdf_filenames.map {|path| parse_file_name_and_store_file(path) }.compact

        all_pdf_filenames = all_pdf_filenames + pdf_filenames
        all_iep_documents = all_iep_documents + iep_documents
      end

      log "IepPdfImportJob: stored #{all_iep_documents.size} IEP PDFs and dropped #{all_pdf_filenames.size - all_iep_documents.size} PDF files..."
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

      file_info.validata_filename_or_raise!

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
      client = SftpClient.for_x2(nil, unsafe_local_download_folder: absolute_local_download_path)

      begin
        local_file = client.download_file(remote_filename)
        log "downloaded a file!"
        local_file
      rescue RuntimeError => error
        message = error.message

        if message.include?('no such file')
          log error.message
          log 'No file found but no worries, just means no educators added IEPs into the EasyIEP system that particular day.'
          nil
        else
          raise error
        end
      end
    end

    def absolute_local_download_path
      Rails.root.join(File.join('tmp', 'data_download', 'unzipped_ieps'))
    end

    def clean_up
      FileUtils.rm_rf(absolute_local_download_path)
    end

end
