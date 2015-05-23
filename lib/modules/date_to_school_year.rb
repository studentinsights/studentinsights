module DateToSchoolYear
  def date_to_school_year(event_date)
    # If month is Aug to Dec, event falls in first half of school year
    # If month is Jan to Jul, event falls in second half of school year
    month, year = event_date.month, event_date.year
    if month >= 8 && month <= 12
      year_start, year_end = year, year + 1
    elsif month >= 1 && month <= 7
      year_start, year_end = year - 1, year
    end
    school_year_name = "#{year_start}-#{year_end}"
    school_year = SchoolYear.where(name: school_year_name).first_or_create!
    school_year.update(start: Date.new(year_start.to_i, 8, 1), end: Date.new(year_end.to_i, 7, 31))
    return school_year
  end
end
