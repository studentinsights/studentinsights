require 'json'

# Example usage:
#
# filenames_to_check = [...]
# coverage_files = Dir.glob('coverage/shards/*')
# enforcer = CoverageEnforcer.new(filenames_to_check)
# merged_results = enforcer.merge_shards(coverage_files)
# enforcer.enforce!(merged_results)
class CoverageEnforcer
  ERROR_STATUS_CODE = 172
  MISSING_FILES_STATUS_CODE = 173

  def initialize(filenames_to_check)
    @filenames_to_check = filenames_to_check || []
  end

  def enforce!(coverage_result)
    files_with_coverage = compute_covered_percentage(coverage_result)
    fail_if_uncovered!(files_with_coverage)
  end

  # Merge multiple Coverage.result files (eg, from sharding tests across hosts)
  # Returns JSON string
  def merge_shards(coverage_result_filenames)
    final_result = {}

    # collapse results from each shard in each file
    coverage_results = coverage_result_filenames.flat_map do |result_filename|
      result_file = JSON.parse(IO.read(result_filename))
      result_file.values.map {|shard| shard['coverage'] }
    end

    # process each result
    puts "CoverageEnforcer: Merging #{coverage_results.size} result shards..."
    coverage_results.each do |result|
      result.keys.each do |filename|
        lines = result[filename]['lines']
        if !final_result.has_key?(filename)
          final_result[filename] = { 'lines' => lines }
          next
        end

        # merge
        existing_lines = final_result[filename]['lines']
        if existing_lines.size != lines.size
          puts "CoverageEnforcer: WARNING, line length does not match for #{filename}"
        end
        existing_lines.each_with_index do |existing_line, line_index|
          if existing_line.nil? && !lines[line_index].nil? || !existing_line.nil? && lines[line_index].nil?
            puts "CoverageEnforcer: WARNING, one line is nil but the other is not for #{filename}"
          end
          if !lines[line_index].nil?
            existing_line += lines[line_index]
          end
        end
      end
    end
    final_result
  end

  private
  # Takes Coverage.result, returns list of hashes
  # with {'filename'=>'/User/foo.rb', 'covered_percentage'=>87.12}
  def compute_covered_percentage(coverage_result)
    filenames = coverage_result.keys
    files_with_coverage = filenames.map do |filename|
      lines = coverage_result[filename]['lines']
      lines_coverable = 0
      lines_covered = 0
      lines.each do |times_covered|
        next if times_covered.nil?
        lines_coverable += 1
        if times_covered > 0
          lines_covered += 1
        end
      end
      covered_percentage = if lines_coverable == 0
        100.0
      else
        100.0 * lines_covered / lines_coverable.to_f
      end
      { 'filename' => filename, 'covered_percentage' => covered_percentage }
    end
    files_with_coverage
  end

  def fail_if_uncovered!(files_with_coverage)
    files_with_coverage_to_check = filtered_files(files_with_coverage)
    uncovered_files_with_coverage = files_with_coverage_to_check.select {|file_with_coverage| file_with_coverage['covered_percentage'] < 100.0 }

    if files_with_coverage_to_check.size == 0
      puts "CoverageEnforcer: Within these results, found no files to check for full coverage, skipping..."
    elsif uncovered_files_with_coverage.size == 0
      puts "CoverageEnforcer: Within these results, checked #{files_with_coverage_to_check.size} files for full coverage, all passed!"
    else
      puts "CoverageEnforcer: Within these results, checked #{files_with_coverage_to_check.size} files for full coverage."
      puts "CoverageEnforcer: Found #{uncovered_files_with_coverage.size} #{uncovered_files_with_coverage.size == 1 ? 'file that was not' : 'files that were not'} fully covered."
      file_lines = uncovered_files_with_coverage.map do |file_with_coverage|
        "#{file_with_coverage['filename']} - #{file_with_coverage['covered_percentage'].round}%"
      end
      puts " - " + file_lines.join("\n - ")
      puts "\n\nERROR from CoverageChecker\n\n"
      puts "CoverageEnforcer: Exiting with error status #{ERROR_STATUS_CODE}"
      Kernel.exit ERROR_STATUS_CODE
    end
  end

  def filenames_to_check
    @filenames_to_check
  end

  def filtered_files(files_with_coverage)
    files_matching_filter = files_with_coverage.select do |file_with_coverage|
      filenames_to_check.any? {|file_to_check| file_with_coverage['filename'].end_with?(file_to_check)}
    end
    if files_matching_filter.length < filenames_to_check.size
      puts "\n\nERROR from CoverageChecker\n\n"
      puts "CoverageEnforcer: Only found #{files_matching_filter.size} files, but there were #{filenames_to_check.length} patterns listed in the config.  Exiting with error status #{MISSING_FILES_STATUS_CODE}"
      Kernel.exit MISSING_FILES_STATUS_CODE
    end
    files_matching_filter
  end
end
