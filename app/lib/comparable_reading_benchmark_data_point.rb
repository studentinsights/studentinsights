# Wraps ReadingBenchmarkDataPoint with a comparator for using < etc.
class ComparableReadingBenchmarkDataPoint
  include Comparable

  def initialize(reading_benchmark_data_point)
    @data_point = reading_benchmark_data_point
  end

  # implement Comparable
  def <=>(other)
    ordering <=> other.ordering
  end

  def ordering
    raw_value = @data_point.json['value']
    type = type_map.fetch(@data_point.benchmark_assessment_key, :unknown)
    case type
      when :int then raw_value.try(:to_i)
      when :f_and_p then FAndPInterpreter.new.ordering(raw_value)
      else raw_value
    end
  end

  private
  def type_map
    {
      'dibels_fsf' => :int,
      'dibels_lnf' => :int,
      'dibels_psf' => :int,
      'dibels_nwf_cls' => :int,
      'dibels_nwf_wwr' => :int,
      'dibels_dorf_wpm' => :int,
      'dibels_dorf_errors' => :int,
      'dibels_dorf_acc' => :int,
      'f_and_p_english' => :f_and_p, # different!
      'f_and_p_spanish' => :f_and_p, # different!
      'instructional_needs' => :text, # text!
      'las_links_speaking' => :int,
      'las_links_listening' => :int,
      'las_links_reading' => :int,
      'las_links_writing' => :int,
      'las_links_overall' => :int
    }
  end
end
