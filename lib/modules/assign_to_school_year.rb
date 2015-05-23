module AssignToSchoolYear
  def assign_to_school_year
    # If month is Aug to Dec, event falls in first half of school year
    # If month is Jan to Jul, event falls in second half of school year
    month, year = event_date.month, event_date.year
    if month >= 8 && month <= 12
      school_year_name = "#{year}-#{year+1}"
    elsif month >= 1 && month <= 7
      school_year_name = "#{year-1}-#{year}"
    end
    school_year = SchoolYear.where(name: school_year_name).first_or_create!
    self.school_year_id = school_year.id
  end
end
