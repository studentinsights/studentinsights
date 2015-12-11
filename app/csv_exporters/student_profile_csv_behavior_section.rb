class StudentProfileCsvBehaviorSection < Struct.new :csv, :exporter
  delegate :data, to: :exporter

  def add
    return unless data[:discipline_incidents_by_school_year].present?
    csv << ['Behavior']
    csv << ['School Year', 'Number of Discipline Incidents']
    school_years_and_discipline_incidents = data[:school_year_names].zip(data[:discipline_incidents_by_school_year])
    school_years_and_discipline_incidents.each { |k, v| csv << [k, v] }
    csv << []
  end

end
