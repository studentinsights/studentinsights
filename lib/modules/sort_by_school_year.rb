module SortBySchoolYear
  def sort_by_school_year
    student = proxy_association.owner
    event_to_sort = proxy_association.reflection.plural_name
    event_hash = {}

    school_years = student.school_years
    school_years.each do |sy|
      school_year_events = sy.send(event_to_sort).find_by_student(student)
      event_hash[sy.name] = school_year_events
    end
    return event_hash
  end
end
