class DistrictConfig

  cattr_accessor :remote_filenames

  def self.set_remote_filenames
    remote_filenames = self.remote_filenames_from_yml

    self.validate_remote_filenames(remote_filenames)

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
