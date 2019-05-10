# requires `create extension fuzzystrmatch` in Postgres
#
# This is for manually importing a large spreadsheet, with historical data
# about students across a range of reading assessments.
# It outputs JSON to the console.
#
# Usage:
# file_text = <<EOD
# ...
# EOD
# educator = Educator.find_by_login_name('...')
# output = MegaReadingProcessor.new(educator.id).import(file_text);nil
class MegaReadingProcessor
  def initialize(educator_id, options = {})
    @educator_id = educator_id
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @matcher = options.fetch(:matcher, ImportMatcher.new)
    @header_rows_count = options.fetch(:header_rows_count, 1)

    @fuzzy_student_matcher = FuzzyStudentMatcher.new
    reset_counters!
  end

  def import(file_text, options = {})
    reset_counters!

    # parse
    rows = []
    StreamingCsvTransformer.from_text(@log, file_text).each_with_index do |row, index|
      flattened_rows = flat_map_rows(row, index)
      next if flattened_rows.nil?

      rows += flattened_rows
      @matcher.count_valid_row
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
    @missing_data_point = 0
    @missing_data_point_because_student_moved_school = 0
    @invalid_student_name_count = 0
    @invalid_student_names_list = []
    @valid_data_points = 0
    @valid_student_name = 0
  end

  def stats
    {
      invalid_student_name_count: @invalid_student_name_count,
      invalid_student_names_list_size: @invalid_student_names_list.size,
      valid_student_name: @valid_student_name,
      missing_data_point: @missing_data_point,
      missing_data_point_because_student_moved_school: @missing_data_point_because_student_moved_school,
      valid_data_points: @valid_data_points
    }
  end

  def flat_map_rows(row, index)
    # Support multiple header rows to explain to users
    # how to enter data, etc.
    if (index + 1) < @header_rows_count
      return nil
    end

    # match student
    last_first_name = row['Name']
    fuzzy_match = @fuzzy_student_matcher.match_from_last_first(last_first_name)
    if fuzzy_match.nil?
      @invalid_student_name_count += 1
      @invalid_student_names_list << last_first_name
      return nil
    end
    student_id = fuzzy_match[:student_id]

    @valid_student_name += 1
    shared = {
      student_id: student_id,
      imported_by_educator_id: @educator_id
    }

    # data points for each grade
    (
      data_points_for_kindergarten(shared, row) +
      data_points_for_first(shared, row) +
      data_points_for_second(shared, row) +
      data_points_for_third(shared, row)
    )
  end

  def data_points_for_kindergarten(shared, row)
    import_data_points(shared, row, [
      ['KF', :fall, :dibels_fsf, 'K / FALL / FSF'],
      ['KF', :fall, :dibels_lnf, 'K / FALL / LNF'],
      ['KF', :winter, :dibels_fsf, 'K / WINTER / FSF'],
      ['KF', :winter, :dibels_lnf, 'K / WINTER / LNF'],
      ['KF', :winter, :dibels_psf, 'K / WINTER / PSF'],
      ['KF', :winter, :dibels_nwf_cls, 'K / WINTER / NWF CLS'],
      ['KF', :winter, :dibels_nwf_wwr, 'K / WINTER / NWF WWR'],
      ['KF', :winter, :f_and_p_english, 'K / WINTER / F&P Level English'],
      ['KF', :winter, :instructional_needs, 'K / WINTER / Instructional needs'],
      ['KF', :spring, :dibels_lnf, 'K / SPRING / LNF'],
      ['KF', :spring, :dibels_psf, 'K / SPRING / PSF'],
      ['KF', :spring, :dibels_nwf_cls, 'K / SPRING / NWF CLS'],
      ['KF', :spring, :dibels_nwf_wwr, 'K / SPRING / NWF WWR']
    ])
  end

  def data_points_for_first(shared, row)
    import_data_points(shared, row, [
      ['1', :fall, :dibels_lnf, '1 / FALL / LNF'],
      ['1', :fall, :dibels_psf, '1 / FALL / PSF'],
      ['1', :fall, :dibels_nwf_cls, '1 / FALL / NWF CLS'],
      ['1', :fall, :dibels_nwf_wwr, '1 / FALL / NWF WWR'],
      ['1', :fall, :f_and_p_english, '1 / FALL / F&P Level English'],
      ['1', :fall, :f_and_p_spanish, '1 / FALL / F&P Level Spanish'],
      ['1', :fall, :instructional_needs, '1 / FALL / Instructional needs'],
      ['1', :winter, :dibels_nwf_cls, '1 / WINTER / NWF CLS'],
      ['1', :winter, :dibels_nwf_wwr, '1 / WINTER / NWF WWR'],
      ['1', :winter, :dibels_dorf_wpm, '1 / WINTER / DORF WPM'],
      ['1', :winter, :dibels_dorf_errors, '1 / WINTER / DORF Errors'],
      ['1', :winter, :dibels_dorf_acc, '1 / WINTER / DORF ACC'],
      ['1', :winter, :f_and_p_english, '1 / WINTER / F&P Level English'],
      ['1', :winter, :f_and_p_spanish, '1 / WINTER / F&P Level Spanish'],
      ['1', :winter, :instructional_needs, '1 / WINTER / Instructional needs'],
      ['1', :spring, :dibels_nwf_cls, '1 / SPRING / NWF CLS'],
      ['1', :spring, :dibels_nwf_wwr, '1 / SPRING / NWF WWR'],
      ['1', :spring, :dibels_dorf_wpm, '1 / SPRING / DORF WPM'],
      ['1', :spring, :dibels_dorf_errors, '1 / SPRING / DORF Errors'],
      ['1', :spring, :dibels_dorf_acc, '1 / SPRING / DORF ACC'],
      ['1', :spring, :f_and_p_english, '1 / SPRING / F&P Level English'],
      ['1', :spring, :f_and_p_spanish, '1 / SPRING / F&P Level Spanish'],
      ['1', :spring, :instructional_needs, '1 / SPRING / Instructional needs']
    ])
  end

  def data_points_for_second(shared, row)
    import_data_points(shared, row, [
      ['2', :fall, :dibels_nwf_cls, '2 / FALL / NWF CLS'],
      ['2', :fall, :dibels_nwf_wwr, '2 / FALL / NWF WWR'],
      ['2', :fall, :dibels_dorf_wpm, '2 / FALL / DORF WPM'],
      ['2', :fall, :dibels_dorf_acc, '2 / FALL / DORF ACC'],
      ['2', :winter, :dibels_dorf_wpm, '2 / WINTER / DORF WPM'],
      ['2', :winter, :dibels_dorf_acc, '2 / WINTER / DORF ACC'],
      ['2', :spring, :dibels_dorf_wpm, '2 / SPRING / DORF WPM'],
      ['2', :spring, :dibels_dorf_acc, '2 / SPRING / DORF ACC']
    ])
  end

  def data_points_for_third(shared, row)
    import_data_points(shared, row, [
      ['3', :fall, :dibels_dorf_wpm, '3 / FALL / DORF WPM'],
      ['3', :fall, :dibels_dorf_acc, '3 / FALL / DORF ACC'],
    ])
  end

  # just sugar for unrolling these
  def import_data_points(shared, row, tuples)
    rows = []
    tuples.each do |tuple|
      grade, assessment_period, assessment_key, row_key = tuple
      data_point = row[row_key]
      if data_point.nil? || ['?', 'n/a', 'absent'].include?(data_point.downcase)
        @missing_data_point +=1
        next
      end

      # TODO(kr) remove?
      if data_point.starts_with?('@') || data_point.downcase.include?('move')
        @missing_data_point_because_student_moved_school +=1
        next
      end

      @valid_data_points += 1
      rows << shared.merge({
        grade: grade,
        assessment_period: assessment_period,
        assessment_key: assessment_key,
        data_point: data_point
      })
    end
    rows
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "MegaReadingProcessor: #{text}"
  end
end
