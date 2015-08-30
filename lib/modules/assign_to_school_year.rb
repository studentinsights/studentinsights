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
end
