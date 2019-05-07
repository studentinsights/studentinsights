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
# output = MegaReadingImporter.new(educator.id).import(file_text);nil
class MegaReadingImporter
  def initialize(educator_id, options = {})
    @educator_id = educator_id
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @matcher = options.fetch(:matcher, ImportMatcher.new)
    @header_rows_count = options.fetch(:header_rows_count, 1)
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
    log "MegaReadingImporter#stats: #{stats}"

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
    @invalid_student_name = 0
    @valid_data_points = 0
    @valid_student_name = 0
  end

  def stats
    {
      invalid_student_name: @invalid_student_name,
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

    # Infer student name
    full_name = row['Name'].split(', ').reverse.join(' ')
    student_id = guess_from_name(full_name)
    if student_id.nil?
      @invalid_student_name += 1
      return nil
    end

    @valid_student_name += 1
    shared = {
      student_id: student_id,
      imported_by_educator_id: nil
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
      ['K', :fall, :dibels_fsf, 'K / FALL / FSF'],
      ['K', :fall, :dibels_lnf, 'K / FALL / LNF'],
      ['K', :winter, :dibels_fsf, 'K / WINTER / FSF'],
      ['K', :winter, :dibels_lnf, 'K / WINTER / LNF'],
      ['K', :winter, :dibels_psf, 'K / WINTER / PSF'],
      ['K', :winter, :dibels_nwf_cls, 'K / WINTER / NWF CLS'],
      ['K', :winter, :dibels_nwf_wwr, 'K / WINTER / NWF WWR'],
      ['K', :spring, :dibels_lnf, 'K / SPRING / LNF'],
      ['K', :spring, :dibels_psf, 'K / SPRING / PSF'],
      ['K', :spring, :dibels_nwf_cls, 'K / SPRING / NWF CLS'],
      ['K', :spring, :dibels_nwf_wwr, 'K / SPRING / NWF WWR']
    ])
  end

  def data_points_for_first(shared, row)
    import_data_points(shared, row, [
      ['1', :fall, :dibels_lnf, row['1 / FALL / LNF']],
      ['1', :fall, :dibels_psf, row['1 / FALL / PSF']],
      ['1', :fall, :dibels_nwf_cls, row['1 / FALL / NWF CLS']],
      ['1', :fall, :dibels_nwf_wwr, row['1 / FALL / NWF WWR']],
      ['1', :winter, :dibels_nwf_cls, row['1 / WINTER / NWF CLS']],
      ['1', :winter, :dibels_nwf_wwr, row['1 / WINTER / NWF WWR']],
      ['1', :winter, :dibels_dorf_wpm, row['1 / WINTER / DORF WPM']],
      ['1', :winter, :dibels_dorf_acc, row['1 / WINTER / DORF ACC']],
      ['1', :spring, :dibels_nwf_cls, row['1 / SPRING / NWF CLS']],
      ['1', :spring, :dibels_nwf_wwr, row['1 / SPRING / NWF WWR']],
      ['1', :spring, :dibels_dorf_wpm, row['1 / SPRING / DORF WPM']],
      ['1', :spring, :dibels_dorf_acc, row['1 / SPRING / DORF ACC']]
    ])
  end

  def data_points_for_second(shared, row)
    import_data_points(shared, row, [
      ['2', :fall, :dibels_nwf_cls, row['2 / FALL / NWF CLS']],
      ['2', :fall, :dibels_nwf_wwr, row['2 / FALL / NWF WWR']],
      ['2', :fall, :dibels_dorf_wpm, row['2 / FALL / DORF WPM']],
      ['2', :fall, :dibels_dorf_acc, row['2 / FALL / DORF ACC']],
      ['2', :winter, :dibels_dorf_wpm, row['2 / WINTER / DORF WPM']],
      ['2', :winter, :dibels_dorf_acc, row['2 / WINTER / DORF ACC']],
      ['2', :spring, :dibels_dorf_wpm, row['2 / SPRING / DORF WPM']],
      ['2', :spring, :dibels_dorf_acc, row['2 / SPRING / DORF ACC']]
    ])
  end

  def data_points_for_third(shared, row)
    import_data_points(shared, row, [
      ['3', :fall, :dibels_dorf_wpm, row['3 / FALL / DORF WPM']],
      ['3', :fall, :dibels_dorf_acc, row['3 / FALL / DORF ACC']],
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
      if data_point.starts_with?('@') || ['move'].include?(data_point.downcase)
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

  def guess_from_name(full_name)
    student = match_active_student_exactly(full_name)
    return student.id if student.present?

    fuzzy_matches = fuzzy_match_active_student_name(full_name)
    return fuzzy_matches.first[:id] if fuzzy_matches.size == 1

    nil
  end

  def match_active_student_exactly(full_name)
    first_name, last_name = full_name.split(' ')
    students = Student.active.where(first_name: first_name, last_name: last_name)
    return students.first if students.size == 1
    nil
  end

  # deprecated: See FuzzyStudentMatcher instead.
  # Returns [{:id, :full_name, :distance}] for best few matches
  #
  # This is complicated and written in Arel since it needs to escape
  # the argument to the levenshtein function and I couldn't figure how
  # to do that kind of escaping within a `SELECT`
  def fuzzy_match_any_student_name(full_name_text, options = {})
    distance_threshold = options.fetch(:distance_threshold, 2)
    limit = options.fetch(:limit, 3)
    students = Arel::Table.new('students')
    full_name = Arel::Nodes::NamedFunction.new('CONCAT', [
      students[:first_name],
      Arel::Nodes.build_quoted(' '),
      students[:last_name]
    ])
    distance = Arel::Nodes::NamedFunction.new('LEVENSHTEIN', [
      full_name,
      Arel::Nodes.build_quoted(full_name_text)
    ])
    query = students.project(
      students[:id],
      full_name,
      distance
    ).order(distance).where(distance.lteq(distance_threshold)).take(limit)
    ActiveRecord::Base.connection.execute(query.to_sql).to_a.map do |result|
      {
        id: result['id'],
        full_name: result['concat'],
        levenshtein: result['levenshtein']
      }
    end
  end

  # also check student is active
  def fuzzy_match_active_student_name(full_name_text, options = {})
    results = fuzzy_match_any_student_name(full_name_text, options)

    active_student_ids = Student.active.where(id: results.pluck(:id)).pluck(:id)
    results.select do |result|
      active_student_ids.include?(result[:id])
    end
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "MegaReadingImporter: #{text}"
  end
end
