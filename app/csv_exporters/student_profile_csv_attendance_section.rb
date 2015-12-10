class StudentProfileCsvAttendanceSection < Struct.new :csv, :exporter
  delegate :data, to: :exporter

  def add
    return unless data[:attendance_events_by_school_year].present?
    csv << ['Attendance']
    csv << ['School Year', 'Absences', 'Tardies']
    data[:attendance_events_by_school_year].each do |k, v|
      number_of_absences = v.where(absence: true).count
      number_of_tardies = v.where(tardy: true).count
      csv << [k, number_of_absences, number_of_tardies]
    end
    csv << []
  end

end
