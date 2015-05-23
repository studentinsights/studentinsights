module SortBySchoolYear
  def sort_by_school_year
    group_by { |event| event.school_year.name }
  end
end
