module PrecomputeSearchbarJson

  def self.for_all_educators
    Educator.find_each { |educator| save_student_searchbar_json(educator) }
  end

  def self.for_educators_who_log_in
    educators_who_log_in.find_each { |educator| save_student_searchbar_json(educator) }
  end

  def self.for(educator)
    if educator.districtwide_access
      educator.student_searchbar_json = districtwide_access_json.to_json
    else
      educator.student_searchbar_json = SearchbarHelper.names_for(educator).to_json
    end

    educator.save!
  end

  def self.educators_who_log_in
    Educator.where("sign_in_count > ?", 0)
  end

  def self.districtwide_access_json
    @json_for_all ||= SearchbarHelper.names_for_all_students
  end

end
