class DistrictConfig

  cattr_accessor :remote_filenames

  ### CONFIGURING FILE NAMES FOR REMOTE DATA IMPORT ###

  # To configure a Student Insights instance to read data from remote SFTP,
  # we need to know what filenames to look for.

  # Set filenames for the expected remote files in a .yml file under /config.
  # See config/district_somerville.yml as an example.

  # The file name should reference an ENV['DISTRICT_KEY'] value, like this:
  #
  # => "config/district_#{ENV['DISTRICT_KEY']}.yml"

  def self.set_remote_filenames
    remote_filenames = self.remote_filenames_from_yml

    # In `Rails.env.development`, we don't need to set all these filename variables
    # because they're only needed in a few very specific use cases.

    # The two development use cases that would need these filenames are:
      # (1) test production data import process
      # (2) import production data to local environment to test something locally

    # In `Rails.env.test`, we use fixture .txt files and mocks to simulate imported
    # data, so these variables don't need to be set.

    if Rails.env.production?
      self.validate_remote_filenames(remote_filenames)
    end

    self.remote_filenames = remote_filenames_from_yml
  end

  def self.district_key
    ENV.fetch('DISTRICT_KEY')
  end

  def self.remote_filenames_from_yml
    YAML.load(File.open("config/district_#{self.district_key}.yml"))
        .fetch("config")
        .fetch("remote_filenames")
  end

  def self.expected_keys
    [
      'FILENAME_FOR_STUDENTS_IMPORT',
      'FILENAME_FOR_EDUCATORS_IMPORT',
      'FILENAME_FOR_BEHAVIOR_IMPORT',
      'FILENAME_FOR_ASSESSMENT_IMPORT',
      'FILENAME_FOR_ATTENDANCE_IMPORT',
      'FILENAME_FOR_STUDENT_AVERAGES_IMPORT',
      'FILENAME_FOR_COURSE_SECTION_IMPORT',
      'FILENAME_FOR_STUDENTS_SECTION_ASSIGNMENT_IMPORT',
      'FILENAME_FOR_EDUCATOR_SECTION_ASSIGNMENT_IMPORT',
      'FILENAME_FOR_STAR_READING_IMPORT',
      'FILENAME_FOR_STAR_MATH_IMPORT',
    ]
  end

  def self.validate_remote_filenames(remote_filenames)
    if remote_filenames.keys.sort != self.expected_keys.sort
      raise "Unexpected keys!"
    end
  end

end
