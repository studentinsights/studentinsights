class PrecomputeSearchbarJson

  def for_all_educators
    Educator.find_each { |educator| self.for(educator) }
  end

  def for_educators_who_log_in
    educators_who_log_in.find_each { |educator| self.for(educator) }
  end

  def for(educator)
    if educator.districtwide_access
      educator.student_searchbar_json = districtwide_access_json.to_json
    else
      educator.student_searchbar_json = SearchbarHelper.names_for(educator).to_json
    end

    educator.save!
  end

  def educators_who_log_in
    Educator.where("sign_in_count > ?", 0)
  end

  def districtwide_access_json
    @json_for_all ||= SearchbarHelper.names_for_all_students
  end

end
