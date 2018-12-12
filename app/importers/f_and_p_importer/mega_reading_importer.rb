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
      rows += flattened_rows
      @matcher.count_valid_row if flattened_rows.length > 0
    end
    log "matcher#stats: #{@matcher.stats}"

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
    rows = []

    full_name = row['Name'].split(', ').reverse.join(' ')
    student_id = guess_from_name(full_name)
    if student_id.nil?
      @invalid_student_name += 1
      return []
    end

    @valid_student_name += 1
    shared = {
      student_id: student_id,
      imported_by_educator_id: nil
    }

    # kindergarten
    rows += rows_for_kindergarten(shared, row)
    # rows += rows_for_first(shared)

    rows
  end

  def rows_for_kindergarten(shared, row)
    rows = []

    # fall
    rows += import_bits(shared.merge({
      assessment_grade: 'K',
      assessment_season_key: :fall
    }), [
      [:dibels_fsf, row['fall K - FSF']],
      [:dibels_lnf, row['fall K - LNF']]
    ])

    # winter
    rows += import_bits(shared.merge({
      assessment_grade: 'K',
      assessment_season_key: :winter
    }), [
      [:dibels_fsf, row['winter K - FSF']],
      [:dibels_lnf, row['winter K - LNF']],
      [:dibels_psf, row['winter K - PSF']],
      [:dibels_nwf_cls, row['winter K - NWF CLS']],
      [:dibels_nwf_wwr, row['winter K - NWF WWR']]
    ])

    # spring
    rows += import_bits(shared.merge({
      assessment_grade: 'K',
      assessment_season_key: :spring
    }), [
      [:dibels_lnf, row['spring K - LNF']],
      [:dibels_psf, row['spring K - PSF']],
      [:dibels_nwf_cls, row['spring K - NWF CLS']],
      [:dibels_nwf_wwr, row['spring K - NWF WWR']]
    ])

    rows
  end

  # just sugar
  def import_bits(shared, pairs)
    rows = []
    pairs.each do |assessment_key, data_point|
      if ['n/a', 'absent'].include?(data_point.downcase)
        @missing_data_point +=1
        next
      end

      if data_point.starts_with?('@')
        @missing_data_point_because_student_moved_school +=1
        next
      end

      @valid_data_points += 1
      rows << shared.merge({
        assessment_key: assessment_key,
        data_point: data_point
      })
    end
    rows
  end

  #     'winter K - FSF' => row['winter K - FSF'],
  #     'winter K - LNF' => row['winter K - LNF'],
  #     'winter K - PSF' => row['winter K - PSF'],
  #     'winter K - NWF CLS' => row['winter K - NWF CLS'],
  #     'winter K - NWF WWR' => row['winter K - NWF WWR'],
  #     'spring K - LNF' => row['spring K - LNF'],
  #     'spring K - PSF' => row['spring K - PSF'],
  #     'spring K - NWF CLS,' => row['spring K - NWF CLS'],
  #     'spring K - NWF WWR' => row['spring K - NWF WWR'],
  #     'fall 1 LNF' => row['fall 1 LNF'],
  #     'fall 1 PSF' => row['fall 1 PSF'],
  #     'fall 1 NWF CLS' => row['fall 1 NWF CLS'],
  #     'fall 1 NWF WWR' => row['fall 1 NWF WWR'],
  #     'winter1 NWF-CLS' => row['winter1 NWF-CLS'],
  #     'winter1 NWF-WWR' => row['winter1 NWF-WWR'],
  #     'winter1 DORF-WPM' => row['winter1 DORF-WPM'],
  #     'winter1 DORF-acc' => row['winter1 DORF-acc'],
  #     'spring1 NWF-CLS' => row['spring1 NWF-CLS'],
  #     'spring1 NWF WWR' => row['spring1 NWF WWR'],
  #     'spring1 DORF-WPM' => row['spring1 DORF-WPM'],
  #     'spring1 DORF-acc' => row['spring1 DORF-acc'],
  #     '2fall NWF-CLS' => row['2fall NWF-CLS'],
  #     '2 fall NWF-WWR' => row['2 fall NWF-WWR'],
  #     '2fall DORF WPM' => row['2fall DORF WPM'],
  #     '2fall DORF-acc' => row['2fall DORF-acc'],
  #     '2 winter DORF WPM' => row['2 winter DORF WPM'],
  #     '2 winter DORF acc' => row['2 winter DORF acc'],
  #     '2spring DORF WPM' => row['2spring DORF WPM'],
  #     '2spring DORF acc' => row['2spring DORF acc'],
  #     '3fall DORF WPM' => row['3fall DORF WPM'],
  #     '3fall DORF acc ' => row['3fall DORF acc']
  #   }
  # end

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

    active_student_ids = Student.active.where(id: results.pluck('id')).pluck(:id)
    results.select do |result|
      active_student_ids.include?(result[:id])
    end
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "MegaReadingImporter: #{text}"
  end
end
