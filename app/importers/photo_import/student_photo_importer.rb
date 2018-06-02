require 'zip'
require 'tempfile'
require 'fileutils'

class StudentPhotoImporter

  REQUIRED_KEYS = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
  ]

  def initialize
    # raise "missing AWS keys!" if REQUIRED_KEYS.any? { |aws_key| (ENV[aws_key]).nil? }
  end

  def import
    FileUtils.mkdir_p('tmp/data_download/photos')

    log('Downloading photos.zip from SFTP site...')

    photos_zip_file = client.download_file('photos.zip')

    log("Downloaded Photos ZIP file!")

    unzipped_count = 0

    Zip::File.open(photos_zip_file) do |zip_file|
      zip_file.each do |entry|
        entry.extract("tmp/data_download/photos/#{entry.name}")
        unzipped_count += 1
      end
    end

    log("Unzipped #{unzipped_count} photos!")
  end

  def client
    SftpClient.for_x2
  end

  def logger
    Logger.new(STDOUT)
  end

  def log(msg)
    logger.info(msg)
  end

end