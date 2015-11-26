module AssignToSchoolYear

  def assign_to_school_year
    date_attribute = [:date_taken, :event_date, :start_date]
    date_attribute.each do |a|
      if methods.include? a
        date = self.send(a)
        school_year = date_to_school_year(date)
        self.school_year_id = school_year.id
      end
    end
  end

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
    school_year.update(start: Date.new(year_start.to_i, 8, 1))
    return school_year
  end

end
