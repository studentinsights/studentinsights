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
    photos_zip_file = client.download_file('photos.zip')
    log("downloaded Photos ZIP file!")

    Zip::File.open(photos_zip_file) do |zip_file|
      zip_file.each do |entry|
        puts entry.name
      end
    end
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