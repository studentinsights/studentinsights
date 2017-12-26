class DistrictConfig

  def remote_filenames
    remote_filenames = load_remote_filenames_from_yml

    if Rails.env.production?
      validate_remote_filenames(remote_filenames)
    end

    return remote_filenames
  end

  private

  def district_key
    ENV.fetch('DISTRICT_KEY')
  end

  def district_key_to_config_file
    {
      'somerville' => 'config/district_somerville.yml',
      'new_bedford' => 'config/district_new_bedford.yml',
    }
  end

  def config_file_path
    district_key_to_config_file.fetch(district_key)
  end

  def load_remote_filenames_from_yml
    YAML.load(File.open(config_file_path)).fetch("remote_filenames")
  end

  def expected_keys
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

  def validate_remote_filenames(remote_filenames)
    if remote_filenames.keys.sort != expected_keys.sort
      raise "Unexpected keys!"
    end
  end

end
