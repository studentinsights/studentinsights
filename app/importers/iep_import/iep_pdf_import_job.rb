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

    @time_now = options.fetch(:time_now, Time.now)
    @s3_client = options.fetch(:s3_client, Aws::S3::Client.new)
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
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
    # Download zip files
    log 'Downloading zip files...'
    clean_up
    FileUtils.mkdir_p(absolute_local_download_path)
    zip_files = download_zips(remote_filenames)
    log "  Downloaded #{zip_files.size} zip files."

    # Unzip locally to get all the pdf filenames
    pdf_filenames = unzipped_pdf_filenames(zip_files)

    # Store new files and create IepDocuments for each PDF file
    created_iep_documents_count = 0
    pdf_filenames.each do |path|
      storer = IepStorer.new({
        path_to_file: path,
        s3_client: @s3_client,
        log: @log
      })
      iep_document = storer.store_only_new
      created_iep_documents_count += 1 if iep_document.present?
    end

    log "found #{pdf_filenames.size} PDF files within downloaded zips."
    log "created #{created_iep_documents_count} IepDocument records."
    log "done."
  end

  def download_zips(remote_filenames)
    zip_files = []
    remote_filenames.each do |filename|
      zip_file = download(filename)
      next if zip_file.nil? # this is normal, if there are no changes on a day, there won't be a file
      zip_files << zip_file
    end
    zip_files
  end

  def unzipped_pdf_filenames(zip_files)
    zip_files.flat_map do |zip_file|
      pdf_filenames = []

      # There may be collisions on filename across the zips, so unzip each zip into its
      # own subfolder
      zip_basename = Pathname.new(zip_file).basename
      folder_for_unzipped_files = File.join(absolute_local_download_path, 'unzipped', zip_basename)
      FileUtils.mkdir_p(folder_for_unzipped_files)
      unzipped_count_for_file = 0

      begin
        log "  unzipping #{zip_basename}..."
        Zip::File.open(zip_file) do |zip_object|
          zip_object.each do |entry|
            unzipped_pdf_filename = File.join(folder_for_unzipped_files, entry.name)
            entry.extract(unzipped_pdf_filename)
            unzipped_count_for_file += 1
            pdf_filenames << unzipped_pdf_filename
          end
        end
      rescue => e
        log e.message
      end

      # return the File objects that we unzipped
      log "   unzipped #{unzipped_count_for_file} files from #{zip_basename}..."
      pdf_filenames
    end
  end

  def download(remote_filename)
    sftp_client = SftpClient.for_x2(nil, unsafe_local_download_folder: absolute_local_download_path)

    begin
      local_file = sftp_client.download_file(remote_filename)
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

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "IepPdfImportJob: #{text}"
  end

  def absolute_local_download_path
    Rails.root.join(File.join('tmp', 'data_download', 'unzipped_ieps'))
  end

  def clean_up
    FileUtils.rm_rf(absolute_local_download_path)
  end
end
