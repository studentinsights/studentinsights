# Helper for fuzzily matching names to student records
# Intended more for semi-automated console use, patching up data before import.
#
# Example:
#   matcher = FuzzyStudentMatcher.new
#   output = matcher.match_file(file_text) {|row| matcher.match_from_last_first(row['Student_Name']) }
class FuzzyStudentMatcher
  def initialize(options = {})
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    reset_counters!
  end

  def match_from_last_first(text)
    full_name = text.split(', ').reverse.join(' ')
    match_from_full_name(full_name)
  end

  def match_from_full_name(full_name)
    student_id = guess_from_name(full_name)
    if student_id.nil?
      @invalid_student_name += 1
      return nil
    end

    @valid_student_name += 1
    {
      full_name: full_name,
      student_id: student_id
    }
  end

  def match_file(file_text, &block)
    reset_counters!

    # parse
    rows = []
    StreamingCsvTransformer.from_text(@log, file_text).each_with_index do |row, index|
      rows << block.call(row)
    end
    log "FuzzyStudentMatcher#stats: #{stats}"

    [rows, stats]
  end

  private
  def reset_counters!
    @invalid_student_name = 0
    @valid_student_name = 0
  end

  def stats
    {
      invalid_student_name: @invalid_student_name,
      valid_data_points: @valid_data_points
    }
  end

  def guess_from_name(full_name)
    return nil if full_name.nil? || full_name.empty?

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
    @log.puts "FuzzyStudentMatcher: #{text}"
  end
end
