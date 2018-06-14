require 'zip'
require 'tempfile'
require 'fileutils'

class StudentPhotoImporter

  REQUIRED_KEYS = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_PHOTOS_BUCKET'
  ]

  def initialize
    raise "import_student_photos? not enabled" unless PerDistrict.new.import_student_photos?
    raise "missing AWS keys!" if REQUIRED_KEYS.any? { |aws_key| (ENV[aws_key]).nil? }

    @time_now = Time.now
  end

  def import
    FileUtils.mkdir_p('tmp/data_download/photos')

    log('Downloading photos.zip from SFTP site...')

    photos_zip_file = sftp_client.download_file('photos.zip')

    log("Downloaded Photos ZIP file!")

    unzipped_count = 0

    Zip::File.open(photos_zip_file) do |zip_file|
      zip_file.each do |entry|
        entry.extract("tmp/data_download/photos/#{entry.name}") { true } # overwrite
        unzipped_count += 1
      end
    end

    log("Unzipped #{unzipped_count} photos!")
    log("Storing photo files...")

    created_student_photos_count = 0
    photo_filenames = Dir["tmp/data_download/photos/*"]

    photo_filenames.each do |path|
      student_local_id = Pathname.new(path).basename.sub_ext('').to_s

      student_photo = PhotoStorer.new(
        path_to_file: path,
        local_id: student_local_id,
        s3_client: s3_client,
        logger: logger,
        time_now: @time_now
      ).store_only_new

      created_student_photos_count += 1 if student_photo.present?
    end

    log("Created #{created_student_photos_count} StudentPhoto records")
    log("Done.")
  end

  def sftp_client
    @sftp_client ||= SftpClient.for_x2
  end

  def s3_client
    @s3_client ||= Aws::S3::Client.new(region: 'us-west-2')
  end

  def logger
    Logger.new(STDOUT)
  end

  def log(msg)
    logger.info(msg)
  end
end
