class StudentProfileChart < Struct.new :student

  def chart_data
    {
      attendance_series_absences: attendance_series_absences,
      attendance_series_tardies: attendance_series_tardies,
      attendance_events_school_years: attendance_events_school_years,
      behavior_series: behavior_series,
      behavior_series_school_years: behavior_series_school_years,
      star_series_math_percentile: star_series_math_percentile,
      star_series_reading_percentile: star_series_reading_percentile,
      mcas_series_math_scaled: mcas_series_math_scaled,
      mcas_series_ela_scaled: mcas_series_ela_scaled,
      mcas_series_math_growth: mcas_series_math_growth,
      mcas_series_ela_growth: mcas_series_ela_growth
    }
  end

  def star_series_math_percentile
    student.star_results.order(date_taken: :asc).map do |s|
      [ s.date_taken.year, s.date_taken.month, s.date_taken.day, s.math_percentile_rank ]
    end
  end

  def star_series_reading_percentile
    student.star_results.order(date_taken: :asc).map do |s|
      [ s.date_taken.year, s.date_taken.month, s.date_taken.day, s.reading_percentile_rank ]
    end
  end

  def mcas_series_math_scaled
    student.mcas_results.order(date_taken: :asc).map do |m|
      [ m.date_taken.year, m.date_taken.month, m.date_taken.day, m.math_scaled ]
    end
  end

  def mcas_series_ela_scaled
    student.mcas_results.order(date_taken: :asc).map do |m|
      [ m.date_taken.year, m.date_taken.month, m.date_taken.day, m.ela_scaled ]
    end
  end

  def mcas_series_math_growth
    student.mcas_results.order(date_taken: :asc).map do |m|
      [ m.date_taken.year, m.date_taken.month, m.date_taken.day, m.math_growth ]
    end
  end

  def mcas_series_ela_growth
    student.mcas_results.order(date_taken: :asc).map do |m|
      [ m.date_taken.year, m.date_taken.month, m.date_taken.day, m.ela_growth ]
    end
  end

  def attendance_series_absences
    student.attendance_events.sort_by_school_year.values.map { |v| v.select(:absence).size }.reverse
  end

  def attendance_series_tardies
    student.attendance_events.sort_by_school_year.values.map { |v| v.select(:tardy).size }.reverse
  end

  def attendance_events_school_years
    student.attendance_events.sort_by_school_year.keys.reverse
  end

  def behavior_series
    student.discipline_incidents.sort_by_school_year.values.map { |v| v.size }.reverse
  end

  def behavior_series_school_years
    student.discipline_incidents.sort_by_school_year.keys.reverse
  end

end
