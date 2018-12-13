# requires `create extension fuzzystrmatch`
#
#
# Usage:
# file_text = <<EOD
# ...
# EOD
# benchmark_date = Date.parse('2018/12/19')
# educator = Educator.find_by_login_name('...')
# output = MegaReadingImporter.new(educator.id).import(file_text);nil
class MegaReadingImporter
  def initialize(educator_id, options = {})
    # @benchmark_date = benchmark_date
    @educator_id = educator_id
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @matcher = options.fetch(:matcher, ImportMatcher.new)
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

    # write to database
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
      data_points_for_second(shared, row)
    )
  end

  def data_points_for_kindergarten(shared, row)
    import_data_points(shared, [
      ['K', :fall, :dibels_fsf, row['fall K - FSF']],
      ['K', :fall, :dibels_lnf, row['fall K - LNF']],
      ['K', :winter, :dibels_fsf, row['winter K - FSF']],
      ['K', :winter, :dibels_lnf, row['winter K - LNF']],
      ['K', :winter, :dibels_psf, row['winter K - PSF']],
      ['K', :winter, :dibels_nwf_cls, row['winter K - NWF CLS']],
      ['K', :winter, :dibels_nwf_wwr, row['winter K - NWF WWR']],
      ['K', :spring, :dibels_lnf, row['spring K - LNF']],
      ['K', :spring, :dibels_psf, row['spring K - PSF']],
      ['K', :spring, :dibels_nwf_cls, row['spring K - NWF CLS']],
      ['K', :spring, :dibels_nwf_wwr, row['spring K - NWF WWR']]
    ])
  end

  def data_points_for_first(shared, row)
    import_data_points(shared, [
      ['1', :fall, :dibels_lnf, row['fall 1 LNF']],
      ['1', :fall, :dibels_psf, row['fall 1 PSF']],
      ['1', :fall, :dibels_nwf_cls, row['fall 1 NWF CLS']],
      ['1', :fall, :dibels_nwf_wwr, row['fall 1 NWF WWR']],
      ['1', :winter, :dibels_nwf_cls, row['winter1 NWF-CLS']],
      ['1', :winter, :dibels_nwf_wwr, row['winter1 NWF-WWR']],
      ['1', :winter, :dibels_dorf_wpm, row['winter1 DORF-WPM']],
      ['1', :winter, :dibels_dorf_acc, row['winter1 DORF-acc']],
      ['1', :spring, :dibels_nwf_cls, row['spring1 NWF-CLS']],
      ['1', :spring, :dibels_nwf_wwr, row['spring1 NWF WWR']],
      ['1', :spring, :dibels_dorf_wpm, row['spring1 DORF-WPM']],
      ['1', :spring, :dibels_dorf_acc, row['spring1 DORF-acc']]
    ])
  end

  def data_points_for_second(shared, row)
    import_data_points(shared, [
      ['2', :fall, :dibels_nwf_cls, row['2fall NWF-CLS']],
      ['2', :fall, :dibels_nwf_wwr, row['2 fall NWF-WWR']],
      ['2', :fall, :dibels_dorf_wpm, row['2fall DORF WPM']],
      ['2', :fall, :dibels_dorf_acc, row['2fall DORF-acc']],
      ['2', :winter, :dibels_dorf_wpm, row['2 winter DORF WPM']],
      ['2', :winter, :dibels_dorf_acc, row['2 winter DORF acc']],
      ['2', :spring, :dibels_dorf_wpm, row['2spring DORF WPM']],
      ['2', :spring, :dibels_dorf_acc, row['2spring DORF acc']]
    ])
  end

  def data_points_for_third(shared, row)
    import_data_points(shared, [
      ['3', :fall, :dibels_dorf_wpm, row['3fall DORF WPM']],
      ['3', :fall, :dibels_dorf_acc, row['3fall DORF acc']],
    ])
  end

  # just sugar for unrolling these
  def import_data_points(shared, tuples)
    rows = []
    tuples.each do |tuple|
      grade, assessment_period, assessment_key, data_point = tuple
      if data_point.nil? || ['n/a', 'absent'].include?(data_point.downcase)
        @missing_data_point +=1
        next
      end

      if data_point.starts_with?('@')
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
