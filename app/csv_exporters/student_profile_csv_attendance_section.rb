class StudentProfileCsvAttendanceSection < Struct.new :csv, :exporter
  delegate :data, to: :exporter

  def add
    return if data[:absences_count_by_school_year].blank? && data[:tardies_count_by_school_year].present?

    csv << ['School Year', 'Number of Absences']
    school_years_and_absences = data[:school_year_names].zip(data[:absences_count_by_school_year])
    school_years_and_absences.each { |k, v| csv << [k, v] }
    csv << []

    csv << ['School Year', 'Number of Tardies']
    school_years_and_tardies = data[:school_year_names].zip(data[:tardies_count_by_school_year])
    school_years_and_tardies.each { |k, v| csv << [k, v] }
  end

end
