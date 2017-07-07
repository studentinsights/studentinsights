require 'zip'
require 'tempfile'


class IepPdfImportJob
  def initialize(options = {})
    @time_now = options[:time_now] || Time.now
  end

  # This imports all the IEP PDFs from a zip that
  # contains several older documents (ie., for a first-time import).
  #
  # It will fail on any errors, log to the console and won't retry.
  def bulk_import!
    remote_filename = 'student-documents_old.zip'

    # pull down the file to heroku dyno
    zip_file = download(remote_filename)
    log "got a zip: #{zip_file.path}"

    log 'making a folder for the unzipped files...'
    date_zip_folder = Rails.root.join('tmp/iep_pdfs/date_zips')
    FileUtils.mkdir_p(date_zip_folder)

    log 'unzipping date bundles...'
    date_zip_filenames = unzip_to_folder(zip_file, date_zip_folder)

    log "got #{date_zip_filenames.size} date zips!"
    filename_pairs = []
    date_zip_filenames.each do |date_zip_filename|
      log "making a folder for #{date_zip_filename}..."
      folder = File.join(date_zip_folder, date_zip_filename)
      FileUtils.mkdir_p(folder)
      date_zip = File.open(date_zip_filename)

      log "  unzipping..."
      pdf_filenames = unzip_to_folder(date_zip, folder)
      pdf_filenames.each do |pdf_filename|
        filename_pairs << {
          pdf_filename: pdf_filename,
          date_zip_filename: date_zip_filename
        }
      end
      log "  creating pairs..."
    end

    log "got #{filename_pairs.size} filename_pairs!"
    log filename_pairs.inspect

    # translate to records
    # extract: (date, student lasid, student name)
    # split on the 0321321_whatever.pdf to get the lasid
    records = []
    filename_pairs.map do |pair|
      # parse pdf filename
      log '    parsing pdf...'
      pdf_filename = pair[:pdf_filename]
      pdf_basename = Pathname.new(pdf_filename).basename.sub_ext('').to_s
      local_id, iep_at_a_glance, *student_names = pdf_basename.split('_')
      if iep_at_a_glance != 'IEPAtAGlance'
        log 'oh no!'
        raise 'oh no!'
      end

      # parse date filename
      log '    parsing date...'
      date_zip_filename = pair[:date_zip_filename]
      date_zip_basename = Pathname.new(date_zip_filename).basename.sub_ext('').to_s
      date = Date.strptime(date_zip_basename, '%m-%d-%Y')
      records << {
        local_id: local_id,
        pdf_filename: pdf_filename,
        date: date.to_s
      }
    end

    log records.to_json

    # TODO
    # write to blob store and db
    #     put the file in blob store key: (date, local_id, filename)
    #     write a record into postgres (date, local_id, filename)

    # delete all files
  end



  def nightly_import!
    # TODO
  end

  private
  def log(str)
    puts str
  end

  def download(remote_filename)
    local_file = Tempfile.new('iep_pdf_zip')
    # TODO(kr) for shortcutting
    # local_filename = File.join('tmp/', remote_filename)
    # return File.open(local_filename, 'r')

    local_file = File.open(local_filename, 'w')
    log "local zip file: #{local_file.path}"
    client = SftpClient.for_x2
    log "have a client!"
    client.sftp_session.download!(remote_filename, local_file.path)
    log "downloaded"
    local_file
  end

  def unzip_to_folder(zip_file, target_folder)
    output_filenames = []
    Zip::File.open(zip_file) do |files_in_zip|
      files_in_zip.each do |file_in_zip|
        log "Extracting #{file_in_zip.name}..."
        output_filename = File.join(target_folder, file_in_zip.name)
        log output_filename
        files_in_zip.extract(file_in_zip, output_filename)
        output_filenames << output_filename
      end
    end
    output_filenames
  end
end
