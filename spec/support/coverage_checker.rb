class CoverageChecker
  ERROR_STATUS_CODE = 172

  # By default, only run this on full test runs (eg, in Travis) or when explicitly asked.
  # In the common development case where you only run a subset of tests, this will have
  # frequent false positive failures (since only some of the tests were run).
  def setup!
    return unless EnvironmentVariable.is_true('ENABLE_RSPEC_COVERAGE_CHECKER')
    SimpleCov.at_exit do
      SimpleCov.result.format!
      fail_if_uncovered!(SimpleCov.result.files)
    end
  end

  private
  def fail_if_uncovered!(files)
    files_to_check = filtered_files(files)
    uncovered_files = files_to_check.select {|file| file.covered_percent < 100 }

    if files_to_check.size == 0
      puts "CoverageChecker: On this run, found no files to check for full coverage, skipping..."
    elsif uncovered_files.size == 0
      puts "CoverageChecker: On this run, checked #{files_to_check.size} files for full coverage, all passed!"
    else
      puts "CoverageChecker: On this run, checked #{files_to_check.size} files for full coverage."
      puts "CoverageChecker: Found #{uncovered_files.size} #{uncovered_files.size == 1 ? 'file that was not' : 'files that were not'} fully covered."
      file_lines = uncovered_files.map do |file|
        "#{file.filename} - #{file.covered_percent.round}%"
      end
      puts " - " + file_lines.join("\n - ")
      puts "CoverageChecked: Exiting with error status #{ERROR_STATUS_CODE}"
      Kernel.exit ERROR_STATUS_CODE
    end
  end

  def filtered_files(files)
    config_file = File.open(File.join(Rails.root, 'spec', 'coverage_bot.yml'))
    files_to_check = YAML.load(config_file)['check_test_coverage_for_files']
    files.select do |file|
      files_to_check.any? {|file_to_check| file.filename.ends_with?(file_to_check)}
    end
  end
end
