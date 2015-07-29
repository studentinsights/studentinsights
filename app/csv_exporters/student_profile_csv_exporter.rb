class StudentProfileCsvExporter < Struct.new :student

  def csv_export_data
    {
      attendance_events: student.attendance_events.sort_by_school_year,
      discipline_incidents: student.discipline_incidents.sort_by_school_year,
      mcas_results: student.mcas_results.order(date_taken: :desc),
      star_results: student.star_results.order(date_taken: :desc)
    }
  end

  def profile_csv_export
    CSV.generate do |csv|
      csv << ['Attendance']
      csv << ['School Year', 'Absences', 'Tardies']
      csv_export_data[:attendance_events].each do |k, v|
        number_of_absences = v.where(absence: true).count
        number_of_tardies = v.where(tardy: true).count
        csv << [k, number_of_absences, number_of_tardies]
      end
      csv << []
      csv << ['Behavior']
      csv << ['Date', 'Number of Discipline Incidents']
      csv_export_data[:discipline_incidents].each do |k, v|
        number_of_discipline_incidents = v.count
        csv << [k, number_of_discipline_incidents]
      end
      csv << []
      csv << ['MCAS']
      csv << ['Date', 'Math Score', 'Math Growth', 'Math Performance',
              'ELA Score', 'ELA Growth', 'ELA Performance']
      csv_export_data[:mcas_results].each do |mcas|
        csv << [mcas.date_taken, mcas.math_scaled, mcas.math_growth, mcas.math_performance,
                mcas.ela_scaled, mcas.ela_growth, mcas.ela_performance]
      end
      csv << []
      csv << ['STAR']
      csv << ['Date', 'Math Percentile', 'Reading Percentile',
              'Instructional Reading Level']
      csv_export_data[:star_results].each do |star|
        csv << [star.date_taken, star.math_percentile_rank, star.reading_percentile_rank,
                star.instructional_reading_level]
      end
    end
  end
end
