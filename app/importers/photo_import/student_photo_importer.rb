require 'zip'
require 'tempfile'
require 'fileutils'

class StudentPhotoImporter

  REQUIRED_KEYS = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_IEP_BUCKET',
  ]

  def initialize
    raise "missing AWS keys!" if REQUIRED_KEYS.any? { |aws_key| (ENV[aws_key]).nil? }
  end

end