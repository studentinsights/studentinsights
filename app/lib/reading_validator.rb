class ReadingValidator
  def self.debug_error_messages
    checks = {}
    keys.each do |key|
      ds = ReadingBenchmarkDataPoint.where(benchmark_assessment_key: key)
      ds.each do |d|
        msg = validator.validate_json_meaning(key, d.json['value'])
        if msg.present?
          checks[key] = (checks.fetch(key, []) + [msg]).uniq.sort
        end
      end
    end
    checks
  end

  def self.debug_float_range
    ranges = {}
    keys.map do |key|
      ds = ReadingBenchmarkDataPoint.where(benchmark_assessment_key: key)
      values = ds.map {|d| d.json['value'].try(:to_f) || nil }.compact
      ranges[key] = { min: values.min, max: values.max }
    end
    keys
  end

  # Sanity-checking `value` for meaning.
  def validate_json_meaning(benchmark_assessment_key, value)
    key = benchmark_assessment_key.to_sym
    case key
      when :dibels_fsf then positive_integer_within(key, value, 0, 100)
      when :dibels_lnf then positive_integer_within(key, value, 0, 500)
      when :dibels_psf then positive_integer_within(key, value, 0, 500)
      when :dibels_nwf_cls then positive_integer_within(key, value, 0, 500)
      when :dibels_nwf_wwr then positive_integer_within(key, value, 0, 100)
      when :dibels_dorf_wpm then positive_integer_within(key, value, 0, 500)
      when :dibels_dorf_errors then positive_integer_within(key, value, 0, 100)
      when :dibels_dorf_acc then percentage_as_integer(key, value)
      when :f_and_p_english then f_and_p_level_strict(key, value)
      when :f_and_p_spanish then f_and_p_level_strict(key, value)
      when :instructional_needs then nil
      when :las_links_speaking then positive_integer_within(key, value, 1, 6)
      when :las_links_listening then positive_integer_within(key, value, 1, 6)
      when :las_links_reading then positive_integer_within(key, value, 1, 6)
      when :las_links_writing then positive_integer_within(key, value, 1, 6)
      when :las_links_overall then positive_integer_within(key, value, 1, 6)
      else "unexpected benchmark_assessment_key=#{key}"
    end
  end

  private
  # inclusive range
  def positive_integer_within(benchmark_assessment_key, value, low, high)
    if value.nil?
      return "nil value for benchmark_assessment_key=#{benchmark_assessment_key}"
    end

    strict_value = value.to_i.to_s.to_i
    if strict_value.to_s != value.to_s
      return "non-integer value for benchmark_assessment_key=#{benchmark_assessment_key}, value=#{value}"
    end

    if value.to_i < low || value.to_i > high
      return "required positive_integer_within(#{low}, #{high}) for benchmark_assessment_key=#{benchmark_assessment_key}, but found: #{value}"
    end

    nil
  end

  def percentage_as_integer(benchmark_assessment_key, value)
    if value.nil?
      return "required percentage_as_integer for benchmark_assessment_key=#{benchmark_assessment_key}, but found nil"
    end

    if value.ends_with?('%')
      return "required percentage_as_integer for benchmark_assessment_key=#{benchmark_assessment_key}, but found value=#{value} with suffix"
    end

    integer_percentage = value.to_i.to_s.to_i
    if integer_percentage.to_s != value.to_s
      return "required percentage_as_integer for benchmark_assessment_key=#{benchmark_assessment_key}, but found value=#{value} that was not an integer"
    end

    if integer_percentage < 0 || integer_percentage > 100
      return "required percentage_as_integer for benchmark_assessment_key=#{benchmark_assessment_key}, but found value=#{value} out of range"
    end
    
    nil
  end

  ORDERED_F_AND_P_LEVELS = ['NR','AA','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','Z+']
  def f_and_p_level_strict(benchmark_assessment_key, value)
    if value.nil?
      return "nil value for benchmark_assessment_key=#{benchmark_assessment_key}"
    end

    if !ORDERED_F_AND_P_LEVELS.include?(value)
      return "required f_and_p_level_strict for benchmark_assessment_key=#{benchmark_assessment_key}, but found: #{value}"
    end
    
    nil
  end
end