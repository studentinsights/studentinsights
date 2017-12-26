class DistrictConfig

  def remote_filenames
    yml_config = LoadDistrictConfig.new.load

    remote_filenames = yml_config.fetch("remote_filenames")

    if Rails.env.production?
      validate_remote_filenames(remote_filenames)
    end

    return remote_filenames
  end

  private

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
