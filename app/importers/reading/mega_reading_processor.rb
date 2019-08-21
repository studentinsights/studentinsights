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

  private
  def reset_counters!
    @blank_data_points_count = 0
    @missing_data_point_because_student_moved_school = 0
    @invalid_student_name_count = 0
    @invalid_student_names_list = []
    @valid_data_points_count = 0
    @valid_student_names_count = 0
  end

  def stats
    {
      invalid_student_name_count: @invalid_student_name_count,
      invalid_student_names_list_size: @invalid_student_names_list.size,
      valid_student_names_count: @valid_student_names_count,
      blank_data_points_count: @blank_data_points_count,
      missing_data_point_because_student_moved_school: @missing_data_point_because_student_moved_school,
      valid_data_points_count: @valid_data_points_count
    }
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
    student_id, student_match_failure = match_student(row, index)
    if student_id.nil?
      @invalid_student_name_count += 1
      @invalid_student_names_list << student_match_failure
      return nil
    end
    @valid_student_names_count += 1

    shared = {
      student_id: student_id,
      educator_id: @educator_id,
      benchmark_school_year: @benchmark_school_year
    }

    # data points for each grade
    (
      data_points_for_kindergarten(shared, row) +
      data_points_for_first(shared, row) +
      data_points_for_second(shared, row) +
      data_points_for_third(shared, row) +
      data_points_for_fourth(shared, row) +
      data_points_for_fifth(shared, row)
    )
  end

  # returns [student_id, debug_match_failure_text]
  # exact primary key
  def match_student(row, index)
    # use canonical key, but support fallback
    student = if row.has_key?('student_local_id')
      Student.find_by_local_id(row['student_local_id'])
    elsif row.has_key?('LASID')
      Student.find_by_local_id(row['LASID'])
    else
      nil
    end

    if student.present?
      [student.id, nil]
    else
      [nil, "row index: #{index}"]
    end
  end

  def data_points_for_kindergarten(shared, row)
    import_data_points(shared, row, [
      ['KF', :fall, :dibels_fsf, 'K / FALL / FSF'],
      ['KF', :fall, :dibels_lnf, 'K / FALL / LNF'],
      ['KF', :fall, :instructional_needs, 'K / FALL / Instructional needs'],
      ['KF', :winter, :dibels_fsf, 'K / WINTER / FSF'],
      ['KF', :winter, :dibels_lnf, 'K / WINTER / LNF'],
      ['KF', :winter, :dibels_psf, 'K / WINTER / PSF'],
      ['KF', :winter, :instructional_needs, 'K / WINTER / Instructional needs'],
      ['KF', :winter, :f_and_p_english, 'K / WINTER / F&P Level English'],
      ['KF', :winter, :f_and_p_spanish, 'K / WINTER / F&P Level Spanish'],
      ['KF', :spring, :dibels_lnf, 'K / SPRING / LNF'],
      ['KF', :spring, :dibels_psf, 'K / SPRING / PSF'],
      ['KF', :spring, :dibels_nwf_cls, 'K / SPRING / NWF CLS'],
      ['KF', :spring, :dibels_nwf_wwr, 'K / SPRING / NWF WWR'],
      ['KF', :spring, :instructional_needs, 'K / SPRING / Instructional needs'],
      ['KF', :spring, :f_and_p_english, 'K / SPRING / F&P Level English'],
      ['KF', :spring, :f_and_p_spanish, 'K / SPRING / F&P Level Spanish'],
      ['KF', :spring, :las_links_speaking, 'K / SPRING / LAS Links Speaking'],
      ['KF', :spring, :las_links_listening, 'K / SPRING / LAS Links Listening']
    ])
  end

  def data_points_for_first(shared, row)
    import_data_points(shared, row, [
      ['1', :fall, :dibels_lnf, '1 / FALL / LNF'],
      ['1', :fall, :dibels_psf, '1 / FALL / PSF'],
      ['1', :fall, :dibels_nwf_cls, '1 / FALL / NWF CLS'],
      ['1', :fall, :dibels_nwf_wwr, '1 / FALL / NWF WWR'],
      ['1', :fall, :instructional_needs, '1 / FALL / Instructional needs'],
      ['1', :fall, :f_and_p_english, '1 / FALL / F&P Level English'],
      ['1', :fall, :f_and_p_spanish, '1 / FALL / F&P Level Spanish'],
      ['1', :winter, :dibels_nwf_cls, '1 / WINTER / NWF CLS'],
      ['1', :winter, :dibels_nwf_wwr, '1 / WINTER / NWF WWR'],
      ['1', :winter, :dibels_dorf_wpm, '1 / WINTER / DORF WPM'],
      ['1', :winter, :dibels_dorf_acc, '1 / WINTER / DORF ACC'],
      ['1', :winter, :dibels_dorf_errors, '1 / WINTER / DORF Errors'],
      ['1', :winter, :instructional_needs, '1 / WINTER / Instructional needs'],
      ['1', :winter, :f_and_p_english, '1 / WINTER / F&P Level English'],
      ['1', :winter, :f_and_p_spanish, '1 / WINTER / F&P Level Spanish'],
      ['1', :spring, :dibels_nwf_cls, '1 / SPRING / NWF CLS'],
      ['1', :spring, :dibels_nwf_wwr, '1 / SPRING / NWF WWR'],
      ['1', :spring, :dibels_dorf_wpm, '1 / SPRING / DORF WPM'],
      ['1', :spring, :dibels_dorf_acc, '1 / SPRING / DORF ACC'],
      ['1', :spring, :dibels_dorf_errors, '1 / SPRING / DORF Errors'],
      ['1', :spring, :instructional_needs, '1 / SPRING / Instructional needs'],
      ['1', :spring, :f_and_p_english, '1 / SPRING / F&P Level English'],
      ['1', :spring, :f_and_p_spanish, '1 / SPRING / F&P Level Spanish'],
      ['1', :spring, :las_links_speaking, '1 / SPRING / LAS Links Speaking'],
      ['1', :spring, :las_links_listening, '1 / SPRING / LAS Links Listening'],
      ['1', :spring, :las_links_reading, '1 / SPRING / LAS Links Reading'],
      ['1', :spring, :las_links_writing, '1 / SPRING / LAS Links Writing'],
      ['1', :spring, :las_links_overall, '1 / SPRING / LAS Links Overall']
    ])
  end

  def data_points_for_second(shared, row)
    import_data_points(shared, row, [
      ['2', :fall, :dibels_nwf_cls, '2 / FALL / NWF-CLS'],
      ['2', :fall, :dibels_nwf_wwr, '2 / FALL / NWF-WWR'],
      ['2', :fall, :dibels_dorf_wpm, '2 / FALL / DORF WPM'],
      ['2', :fall, :dibels_dorf_acc, '2 / FALL / Accuracy'],
      ['2', :fall, :dibels_dorf_errors, '2 / FALL / DORF median errors'],
      ['2', :fall, :instructional_needs, '2 / FALL / Instructional needs'],
      ['2', :fall, :f_and_p_english, '2 / FALL / F&P Level English'],
      ['2', :fall, :f_and_p_spanish, '2 / FALL / F&P Level Spanish'],
      ['2', :winter, :dibels_dorf_wpm, '2 / WINTER / DORF WPM'],
      ['2', :winter, :dibels_dorf_acc, '2 / WINTER / Accuracy'],
      ['2', :winter, :dibels_dorf_errors, '2 / WINTER / DORF median errors'],
      ['2', :winter, :instructional_needs, '2 / WINTER / Instructional needs'],
      ['2', :winter, :f_and_p_english, '2 / WINTER / F&P Level English'],
      ['2', :winter, :f_and_p_spanish, '2 / WINTER / F&P Level Spanish'],
      ['2', :spring, :dibels_dorf_wpm, '2 / WINTER / DORF WPM'],
      ['2', :spring, :dibels_dorf_acc, '2 / WINTER / Accuracy'],
      ['2', :spring, :dibels_dorf_errors, '2 / WINTER / DORF median errors'],
      ['2', :spring, :instructional_needs, '2 / WINTER / Instructional needs'],
      ['2', :spring, :f_and_p_english, '2 / WINTER / F&P Level English'],
      ['2', :spring, :f_and_p_spanish, '2 / WINTER / F&P Level Spanish'],
      ['2', :spring, :las_links_speaking, '2 / SPRING / LAS Links Speaking'],
      ['2', :spring, :las_links_listening, '2 / SPRING / LAS Links Listening'],
      ['2', :spring, :las_links_reading, '2 / SPRING / LAS Links Reading'],
      ['2', :spring, :las_links_writing, '2 / SPRING / LAS Links Writing'],
      ['2', :spring, :las_links_overall, '2 / SPRING / LAS Links Overall']
    ])
  end

  def data_points_for_third(shared, row)
    import_data_points(shared, row, [
      ['3', :fall, :dibels_dorf_wpm, '3 / FALL / DORF WPM'],
      ['3', :fall, :dibels_dorf_acc, '3 / FALL / Accuracy'],
      ['3', :fall, :dibels_dorf_errors, '3 / FALL / DORF median errors'],
      ['3', :fall, :instructional_needs, '3 / FALL / Instructional needs'],
      ['3', :fall, :f_and_p_english, '3 / FALL / F&P Level English'],
      ['3', :fall, :f_and_p_spanish, '3 / FALL / F&P Level Spanish'],
      ['3', :winter, :dibels_dorf_wpm, '3 / WINTER / DORF WPM'],
      ['3', :winter, :dibels_dorf_acc, '3 / WINTER / Accuracy'],
      ['3', :winter, :dibels_dorf_errors, '3 / WINTER / DORF median errors'],
      ['3', :winter, :instructional_needs, '3 / WINTER / Instructional needs'],
      ['3', :winter, :f_and_p_english, '3 / WINTER / F&P Level English'],
      ['3', :winter, :f_and_p_spanish, '3 / WINTER / F&P Level Spanish'],
      ['3', :spring, :dibels_dorf_wpm, '3 / WINTER / DORF WPM'],
      ['3', :spring, :dibels_dorf_acc, '3 / WINTER / Accuracy'],
      ['3', :spring, :dibels_dorf_errors, '3 / WINTER / DORF median errors'],
      ['3', :spring, :instructional_needs, '3 / WINTER / Instructional needs'],
      ['3', :spring, :f_and_p_english, '3 / WINTER / F&P Level English'],
      ['3', :spring, :f_and_p_spanish, '3 / WINTER / F&P Level Spanish'],
      ['3', :spring, :las_links_speaking, '3 / SPRING / LAS Links Speaking'],
      ['3', :spring, :las_links_listening, '3 / SPRING / LAS Links Listening'],
      ['3', :spring, :las_links_reading, '3 / SPRING / LAS Links Reading'],
      ['3', :spring, :las_links_writing, '3 / SPRING / LAS Links Writing'],
      ['3', :spring, :las_links_overall, '3 / SPRING / LAS Links Overall']
    ])
  end

  def data_points_for_fourth(shared, row)
    import_data_points(shared, row, [
      ['4', :fall, :instructional_needs, '4 / FALL / Instructional needs'],
      ['4', :fall, :f_and_p_english, '4 / FALL / F&P Level English'],
      ['4', :fall, :f_and_p_spanish, '4 / FALL / F&P Level Spanish'],
      ['4', :winter, :instructional_needs, '4 / WINTER / Instructional needs'],
      ['4', :winter, :f_and_p_english, '4 / WINTER / F&P Level English'],
      ['4', :winter, :f_and_p_spanish, '4 / WINTER / F&P Level Spanish'],
      ['4', :spring, :instructional_needs, '4 / WINTER / Instructional needs'],
      ['4', :spring, :f_and_p_english, '4 / WINTER / F&P Level English'],
      ['4', :spring, :f_and_p_spanish, '4 / WINTER / F&P Level Spanish']
    ])
  end

  def data_points_for_fifth(shared, row)
    import_data_points(shared, row, [
      ['5', :fall, :instructional_needs, '5 / FALL / Instructional needs'],
      ['5', :fall, :f_and_p_english, '5 / FALL / F&P Level English'],
      ['5', :fall, :f_and_p_spanish, '5 / FALL / F&P Level Spanish'],
      ['5', :winter, :instructional_needs, '5 / WINTER / Instructional needs'],
      ['5', :winter, :f_and_p_english, '5 / WINTER / F&P Level English'],
      ['5', :winter, :f_and_p_spanish, '5 / WINTER / F&P Level Spanish'],
      ['5', :spring, :instructional_needs, '5 / WINTER / Instructional needs'],
      ['5', :spring, :f_and_p_english, '5 / WINTER / F&P Level English'],
      ['5', :spring, :f_and_p_spanish, '5 / WINTER / F&P Level Spanish']
    ])
  end

  # just sugar for unrolling these
  def import_data_points(shared, row, tuples)
    rows = []
    tuples.each do |tuple|
      grade, assessment_period, assessment_key, row_key = tuple

      # If the key isn't there, skip it silently.  This treats
      # each row as if it were really wide with only some columns present.
      if !row.has_key?(row_key)
        next
      end

      # This isn't necessarily a problem, for many templates there are fields
      # that are filled out as the year progresses.
      data_point = row[row_key]
      if data_point.nil? || ['?', 'n/a', 'absent'].include?(data_point.downcase)
        @blank_data_points_count +=1
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
      row = shared.merge(optional_grade_attrs).merge({
        benchmark_period_key: assessment_period,
        benchmark_assessment_key: assessment_key,
        json: {
          value: data_point
        }
      })

      @valid_data_points_count += 1
    end
    rows
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "MegaReadingProcessor: #{text}"
  end
end
