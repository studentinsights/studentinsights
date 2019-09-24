# This is for manually importing a large spreadsheet, with historical data
# about students across a range of reading assessments.
# Returns [rows, stats].
#
# Usage:
# file_text = <<EOD
# ...
# EOD
# educator = Educator.find_by_login_name('...')
# processor = MegaReadingProcessor.new(educator.id, 2018)
# output = processor.process(file_text);nil
# rows, stats = output;nil
class MegaReadingProcessor
  def initialize(educator_id, benchmark_school_year, options = {})
    @educator_id = educator_id
    @benchmark_school_year = benchmark_school_year
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @matcher = options.fetch(:matcher, ImportMatcher.new)

    # The standard 8/20/19 template has two extra rows explaining the columns,
    # we skip them for importing the data.  Some one-off imports may use
    # the 'raw' format and those can be imported by setting this to 0.
    @skip_explanation_rows_count = options.fetch(:skip_explanation_rows_count, 2)
    @use_heuristic_about_moving = options.fetch(:use_heuristic_about_moving, false)
    @include_benchmark_grade = options.fetch(:include_benchmark_grade, false)
    @import_tuples = options.fetch(:import_tuples, all_import_tuples())
    reset_counters!
  end

  def process(file_text)
    reset_counters!

    # parse
    rows = []
    StreamingCsvTransformer.from_text(@log, file_text).each_with_index do |row, index|
      flattened_rows = flat_map_rows(row, index)
      next if flattened_rows.nil?

      rows += flattened_rows
      flattened_rows.size.times { @matcher.count_valid_row }
    end
    log "matcher#stats: #{@matcher.stats}"
    log "MegaReadingProcessor#stats: #{stats}"

    # deprecated, use ReadingBenchmarkData model for F&P instead
    # write to database for F&P only
    # f_and_ps = nil
    # FAndPAssessment.transaction do
    #   FAndPAssessment.where(benchmark_date: @benchmark_date).destroy_all
    #   f_and_ps = rows.map {|row| FAndPAssessment.create!(row) }
    # end
    # f_and_ps
    [rows, stats]
  end

  def stats
    {
      valid_student_names_count: @valid_student_names_count,
      valid_data_points_count: @valid_data_points_count,
      blank_student_name_count: @blank_student_name_count,
      invalid_student_name_count: @invalid_student_name_count,
      invalid_student_names_list_size: @invalid_student_names_list.size,
      blank_data_points_count: @blank_data_points_count,
      missing_data_point_because_student_moved_school: @missing_data_point_because_student_moved_school,
      matcher: @matcher.stats
    }
  end

  private
  def reset_counters!
    @blank_data_points_count = 0
    @missing_data_point_because_student_moved_school = 0
    @invalid_student_name_count = 0
    @invalid_student_names_list = []
    @valid_data_points_count = 0
    @valid_student_names_count = 0
    @blank_student_name_count = 0
  end

  # Map a row of the sheet to attributes that could make ReadingBenchmarkDataPoint
  # records, or nil if the row is invalid.
  def flat_map_rows(row, index)
    # Support multiple header rows to explain to users
    # how to enter data, etc.
    if (index) < @skip_explanation_rows_count
      return []
    end

    # match student
    student_id, student_match_failure, student_match_failure_debug = match_student(row, index)
    if student_id.nil? && student_match_failure == :blank
      @blank_student_name_count += 1
      return nil
    elsif student_id.nil? && student_match_failure == :not_found
      @invalid_student_name_count += 1
      @invalid_student_names_list << student_match_failure_debug
      return nil
    end
    @valid_student_names_count += 1

    shared = {
      student_id: student_id,
      educator_id: @educator_id,
      benchmark_school_year: @benchmark_school_year
    }

    # data points across all grades and assessments
    import_data_points(shared, row, @import_tuples)
  end

  # returns [student_id, reason, debug_match_failure_text]
  # exact primary key
  def match_student(row, index)
    # use canonical key, but support fallback
    local_id = if row.has_key?('student_local_id')
      row['student_local_id']
    elsif row.has_key?('LASID')
      row['LASID']
    else
      nil
    end

    # blank is different than not_found
    if local_id.nil? || local_id == ''
      return [nil, :blank]
    end

    # look it up
    student = Student.find_by_local_id(local_id)
    if student.nil?
      [nil, :not_found, "row index: #{index}"]
    end

    [student.id, nil, nil]
  end

  # just sugar for unrolling these
  def import_data_points(shared, row, tuples)
    data_point_rows = []
    tuples.each do |tuple|
      grade, assessment_period, assessment_key, import_column_key = tuple

      # If the key isn't there, skip it silently.  This treats
      # each row as if it were really wide with only some columns present.
      if !row.has_key?(import_column_key)
        next
      end

      # This isn't necessarily a problem, for many templates there are fields
      # that are filled out as the year progresses.
      data_point = row[import_column_key]
      if data_point.nil? || ['?', 'n/a', 'absent', ''].include?(data_point.downcase)
        @blank_data_points_count += 1
        next
      end

      # This heuristic can make sense for one-time imports for specific purposes,
      # but in the typical case having empty cells is normal, as benchmark data
      # points are filled in throughout the school year, and gaps are also normal
      # when students move around.
      #
      # Since some fields are text, heuristics to infer the codes that educators are
      # going to be noisy, so disabled is a good default.
      if @use_heuristic_about_moving && data_point.starts_with?('@') || data_point.downcase.include?('move')
        @missing_data_point_because_student_moved_school +=1
        next
      end

      # Optionally add the grade (could be useful in cases where grade and
      # school year don't line up).
      optional_grade_attrs = if @include_benchmark_grade
        { benchmark_grade: grade }
      else
        {}
      end

      # transform data point to conform to schema.  this should be minimal,
      # if there is complexity in the input, push that to the interpretation
      # side.
      transformed_data_point = transform_data_point(data_point, grade, assessment_period, assessment_key)
      data_point_row = shared.merge(optional_grade_attrs).merge({
        benchmark_period_key: assessment_period,
        benchmark_assessment_key: assessment_key,
        json: {
          value: transformed_data_point
        }
      })

      @valid_data_points_count += 1
      data_point_rows << data_point_row
    end
    data_point_rows
  end

  def transform_data_point(data_point, grade, assessment_period, assessment_key)
    # Because percentages computed in the sheet are formulas, they are exported
    # like 79% and we cut that off here.  Validations ensure these are integer
    # numbers.
    if assessment_key == :dibels_dorf_acc
      return data_point.chomp('%') if data_point.ends_with?('%')
    end

    data_point
  end

  def all_import_tuples
    (
      tuples_for_kindergarten() +
      tuples_for_first() +
      tuples_for_second() +
      tuples_for_third() +
      tuples_for_fourth() +
      tuples_for_fifth()
    )
  end

  def tuples_for_kindergarten()
    [
      default_tuple('KF', :fall, :dibels_fsf),
      default_tuple('KF', :fall, :dibels_lnf),
      default_tuple('KF', :fall, :instructional_needs),
      default_tuple('KF', :winter, :dibels_fsf),
      default_tuple('KF', :winter, :dibels_lnf),
      default_tuple('KF', :winter, :dibels_psf),
      default_tuple('KF', :winter, :instructional_needs),
      default_tuple('KF', :winter, :f_and_p_english),
      default_tuple('KF', :winter, :f_and_p_spanish),
      default_tuple('KF', :spring, :dibels_lnf),
      default_tuple('KF', :spring, :dibels_psf),
      default_tuple('KF', :spring, :dibels_nwf_cls),
      default_tuple('KF', :spring, :dibels_nwf_wwr),
      default_tuple('KF', :spring, :instructional_needs),
      default_tuple('KF', :spring, :f_and_p_english),
      default_tuple('KF', :spring, :f_and_p_spanish),
      default_tuple('KF', :spring, :las_links_speaking),
      default_tuple('KF', :spring, :las_links_listening),
    ]
  end

  def tuples_for_first()
    [
      default_tuple('1', :fall, :dibels_lnf),
      default_tuple('1', :fall, :dibels_psf),
      default_tuple('1', :fall, :dibels_nwf_cls),
      default_tuple('1', :fall, :dibels_nwf_wwr),
      default_tuple('1', :fall, :instructional_needs),
      default_tuple('1', :fall, :f_and_p_english),
      default_tuple('1', :fall, :f_and_p_spanish),
      default_tuple('1', :winter, :dibels_nwf_cls),
      default_tuple('1', :winter, :dibels_nwf_wwr),
      default_tuple('1', :winter, :dibels_dorf_wpm),
      default_tuple('1', :winter, :dibels_dorf_acc),
      default_tuple('1', :winter, :dibels_dorf_errors),
      default_tuple('1', :winter, :instructional_needs),
      default_tuple('1', :winter, :f_and_p_english),
      default_tuple('1', :winter, :f_and_p_spanish),
      default_tuple('1', :spring, :dibels_nwf_cls),
      default_tuple('1', :spring, :dibels_nwf_wwr),
      default_tuple('1', :spring, :dibels_dorf_wpm),
      default_tuple('1', :spring, :dibels_dorf_acc),
      default_tuple('1', :spring, :dibels_dorf_errors),
      default_tuple('1', :spring, :instructional_needs),
      default_tuple('1', :spring, :f_and_p_english),
      default_tuple('1', :spring, :f_and_p_spanish),
      default_tuple('1', :spring, :las_links_speaking),
      default_tuple('1', :spring, :las_links_listening),
      default_tuple('1', :spring, :las_links_reading),
      default_tuple('1', :spring, :las_links_writing),
      default_tuple('1', :spring, :las_links_overall)
    ]
  end

  def tuples_for_second()
    [
      default_tuple('2', :fall, :dibels_nwf_cls),
      default_tuple('2', :fall, :dibels_nwf_wwr),
      default_tuple('2', :fall, :dibels_dorf_wpm),
      default_tuple('2', :fall, :dibels_dorf_acc),
      default_tuple('2', :fall, :dibels_dorf_errors),
      default_tuple('2', :fall, :instructional_needs),
      default_tuple('2', :fall, :f_and_p_english),
      default_tuple('2', :fall, :f_and_p_spanish),
      default_tuple('2', :winter, :dibels_dorf_wpm),
      default_tuple('2', :winter, :dibels_dorf_acc),
      default_tuple('2', :winter, :dibels_dorf_errors),
      default_tuple('2', :winter, :instructional_needs),
      default_tuple('2', :winter, :f_and_p_english),
      default_tuple('2', :winter, :f_and_p_spanish),
      default_tuple('2', :spring, :dibels_dorf_wpm),
      default_tuple('2', :spring, :dibels_dorf_acc),
      default_tuple('2', :spring, :dibels_dorf_errors),
      default_tuple('2', :spring, :instructional_needs),
      default_tuple('2', :spring, :f_and_p_english),
      default_tuple('2', :spring, :f_and_p_spanish),
      default_tuple('2', :spring, :las_links_speaking),
      default_tuple('2', :spring, :las_links_listening),
      default_tuple('2', :spring, :las_links_reading),
      default_tuple('2', :spring, :las_links_writing),
      default_tuple('2', :spring, :las_links_overall)
    ]
  end

  def tuples_for_third()
    [
      default_tuple('3', :fall, :dibels_dorf_wpm),
      default_tuple('3', :fall, :dibels_dorf_acc),
      default_tuple('3', :fall, :dibels_dorf_errors),
      default_tuple('3', :fall, :instructional_needs),
      default_tuple('3', :fall, :f_and_p_english),
      default_tuple('3', :fall, :f_and_p_spanish),
      default_tuple('3', :winter, :dibels_dorf_wpm),
      default_tuple('3', :winter, :dibels_dorf_acc),
      default_tuple('3', :winter, :dibels_dorf_errors),
      default_tuple('3', :winter, :instructional_needs),
      default_tuple('3', :winter, :f_and_p_english),
      default_tuple('3', :winter, :f_and_p_spanish),
      default_tuple('3', :spring, :dibels_dorf_wpm),
      default_tuple('3', :spring, :dibels_dorf_acc),
      default_tuple('3', :spring, :dibels_dorf_errors),
      default_tuple('3', :spring, :instructional_needs),
      default_tuple('3', :spring, :f_and_p_english),
      default_tuple('3', :spring, :f_and_p_spanish),
      default_tuple('3', :spring, :las_links_speaking),
      default_tuple('3', :spring, :las_links_listening),
      default_tuple('3', :spring, :las_links_reading),
      default_tuple('3', :spring, :las_links_writing),
      default_tuple('3', :spring, :las_links_overall)
    ]
  end

  def tuples_for_fourth()
    [
      default_tuple('4', :fall, :instructional_needs),
      default_tuple('4', :fall, :f_and_p_english),
      default_tuple('4', :fall, :f_and_p_spanish),
      default_tuple('4', :winter, :instructional_needs),
      default_tuple('4', :winter, :f_and_p_english),
      default_tuple('4', :winter, :f_and_p_spanish),
      default_tuple('4', :spring, :instructional_needs),
      default_tuple('4', :spring, :f_and_p_english),
      default_tuple('4', :spring, :f_and_p_spanish)
    ]
  end

  def tuples_for_fifth()
    [
      default_tuple('5', :fall, :instructional_needs),
      default_tuple('5', :fall, :f_and_p_english),
      default_tuple('5', :fall, :f_and_p_spanish),
      default_tuple('5', :winter, :instructional_needs),
      default_tuple('5', :winter, :f_and_p_english),
      default_tuple('5', :winter, :f_and_p_spanish),
      default_tuple('5', :spring, :instructional_needs),
      default_tuple('5', :spring, :f_and_p_english),
      default_tuple('5', :spring, :f_and_p_spanish)
    ]
  end

  def default_tuple(grade, benchmark_period_key, benchmark_assessment_key)
    import_assessment_key = lookup_import_assessment_key(benchmark_assessment_key)
    import_column_key = [
      grade == 'KF' ? 'K' : grade, # translate b/c of decision in original template, designed for educator readability
      benchmark_period_key.upcase,
      import_assessment_key
    ].join(' / ')
    [grade, benchmark_period_key, benchmark_assessment_key, import_column_key]
  end

  # These should all be the same across periods, unless explicitly defined otherwise.
  def lookup_import_assessment_key(benchmark_assessment_key)
    import_key = {
      dibels_fsf: 'FSF',
      dibels_lnf: 'LNF',
      dibels_psf: 'PSF',
      instructional_needs: 'Instructional needs',
      f_and_p_english: 'F&P Level English',
      f_and_p_spanish: 'F&P Level Spanish',
      dibels_dorf_wpm: 'DORF WPM',
      dibels_dorf_acc: 'DORF ACC',
      dibels_dorf_errors: 'DORF Errors',
      dibels_nwf_cls: 'NWF CLS',
      dibels_nwf_wwr: 'NWF WWR',
      las_links_speaking: 'LAS Links Speaking',
      las_links_listening: 'LAS Links Listening',
      las_links_reading: 'LAS Links Reading',
      las_links_writing: 'LAS Links Writing',
      las_links_overall: 'LAS Links Overall'
    }.fetch(benchmark_assessment_key, nil)
    raise "could not find import_key for benchmark_assessment_key:#{benchmark_assessment_key}" if import_key.nil?
    import_key
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "MegaReadingProcessor: #{text}"
  end
end
