class DistrictConfig

  cattr_reader :remote_filenames

  ### CONFIGURING FILE NAMES FOR REMOTE DATA IMPORT ###

  # To configure a Student Insights instance to read data from remote SFTP,
  # set filenames for the 11 expected remote files in district-config.yml.
  # These are the keys we expect under `remote_filenames`:

  def self.expected_remote_filename_keys
    [
      'FILENAME_FOR_STUDENTS_IMPORT',
      'FILENAME_FOR_EDUCATORS_IMPORT',
      'FILENAME_FOR_BEHAVIOR_IMPORT',
      'FILENAME_FOR_ASSESSMENT_IMPORT',
      'FILENAME_FOR_ATTENDANCE_IMPORT',
      'FILENAME_FOR_STAR_READING_IMPORT',
      'FILENAME_FOR_STAR_MATH_IMPORT',
      'FILENAME_FOR_STUDENT_AVERAGES_IMPORT',
      'FILENAME_FOR_COURSE_SECTION_IMPORT',
      'FILENAME_FOR_STUDENTS_SECTION_ASSIGNMENT_IMPORT',
      'FILENAME_FOR_EDUCATOR_SECTION_ASSIGNMENT_IMPORT',
    ]
  end

  def self.get_remote_filenames_from_config(config_source)
    @@remote_filenames = {}

    self.expected_remote_filename_keys.each do |config_key|
      filename = self.fetch_import_filename(config_source, config_key)

      @@remote_filenames[config_key] = filename
    end

    @@remote_filenames.freeze
  end

  def self.fetch_import_filename(config_source, var_name)
    config_source.fetch(var_name) { |name| self.handle_unset_import_filename(name) }
  end

  def self.handle_unset_import_filename(missing_name)
    raise "Unset configuration: #{missing_name}" if Rails.env.production?

    # In `Rails.env.development`, we don't need to set all these variables
    # because they're only needed in a few very specific use cases.

    # The two development use cases that would need these variables are:
      # (1) test production data import process
      # (2) import production data to local environment to test something locally

    # In `Rails.env.test`, we use fixture .txt files and mocks to simulate imported
    # data, so these variables don't need to be set.

    return nil
  end

end
