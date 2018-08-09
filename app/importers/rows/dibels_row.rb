class DibelsRow < Struct.new :row, :student_id, :log
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.

  def build
    benchmark = extract_benchmark_from_string(row[:assessment_performance_level])

    return nil unless benchmark.present?

    DibelsResult.find_or_initialize_by(
      student_id: student_id,
      date_taken: row[:assessment_date],
      benchmark: benchmark
    )
  end

  private
  def extract_benchmark_from_string(raw_string)
    return nil if raw_string.nil?

    return 'CORE' if raw_string.upcase == 'CORE'
    return 'CORE' if raw_string.upcase.include?('CORE')

    return 'STRATEGIC' if raw_string.upcase == 'STRATEGIC'
    return 'STRATEGIC' if raw_string.upcase == 'STRG'
    return 'STRATEGIC' if raw_string.upcase.include?('STRG')
    return 'STRATEGIC' if raw_string.upcase.include?('STRATEGIC')

    return 'INTENSIVE' if raw_string.upcase == 'INT'
    return 'INTENSIVE' if raw_string.upcase == 'INTENSIVE'
    return 'INTENSIVE' if raw_string.upcase.include?('INT')

    log.puts("DibelsRow: couldn't parse DIBELS benchmark: #{raw_string}")

    return nil
  end

end
