class StudentProfileCsvAttendanceSection < Struct.new :csv, :exporter
  delegate :attendance_events_by_school_year, to: :exporter

  def add
    return unless attendance_events_by_school_year.present?
    csv << ['Attendance']
    csv << ['School Year', 'Absences', 'Tardies']
    attendance_events_by_school_year.each do |k, v|
      number_of_absences = v.where(absence: true).count
      number_of_tardies = v.where(tardy: true).count
      csv << [k, number_of_absences, number_of_tardies]
    end
    csv << []
  end

end
