class StudentProfileCsvBehaviorSection < Struct.new :csv, :exporter
  delegate :discipline_incidents_by_school_year, to: :exporter

  def add
    return unless discipline_incidents_by_school_year.present?
    csv << ['Behavior']
    csv << ['Date', 'Number of Discipline Incidents']
    discipline_incidents_by_school_year.each do |k, v|
      number_of_discipline_incidents = v.count
      csv << [k, number_of_discipline_incidents]
    end
    csv << []
  end

end
