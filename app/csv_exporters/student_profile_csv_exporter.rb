require 'csv'

class StudentProfileCsvExporter < Struct.new :data

  def school_years_and_absences
    data[:student].student_school_years.map do |student_school_year|
      [ student_school_year.school_year.name, student_school_year.absences_count ]
    end
  end

  def school_years_and_tardies
    data[:student].student_school_years.map do |student_school_year|
      [ student_school_year.school_year.name, student_school_year.tardies_count ]
    end
  end

  def school_years_and_discipline_incidents
    data[:student].student_school_years.map do |student_school_year|
      [ student_school_year.school_year.name, student_school_year.discipline_incidents_count ]
    end
  end

  def mcas_math_results
    data[:mcas_math_results].map do |result|
      [:date_taken, :scale_score, :growth_percentile, :performance_level].map do |s|
        result.send (s)
      end
    end
  end

  def mcas_ela_results
    data[:mcas_ela_results].map do |results|
      [:date_taken, :scale_score, :growth_percentile, :performance_level].map do |s|
        result.send(s)
      end
    end
  end

  def star_math_results
    data[:star_math_results].map do |result|
      [:date_taken, :percentile_rank].map do |s|
        result.send(s)
      end
    end
  end

  def star_reading_results
    data[:star_reading_results].map do |results|
      [:date_taken, :percentile_rank, :instructional_reading_level].map do |s|
        result.send(s)
      end
    end
  end

  def demographic_row
    [
      ['Demographics'],
      ['Program Assigned', data[:student].program_assigned],
      ['504 Plan', data[:student].plan_504],
      ['Placement', data[:student].sped_placement],
      ['Disability', data[:student].disability],
      ['Level of Need', data[:student].sped_level_of_need],
      ['Language Fluency', data[:student].limited_english_proficiency],
      ['Home Language', data[:student].home_language],
      []
    ]
  end

  def profile_csv_export
    CSV.generate do |csv|
      demographic_row.each { |row| csv << row }
      csv << ['School Year', 'Number of Absences']
      school_years_and_absences.each { |row| csv << row }
      csv << ['School Year', 'Number of Tardies']
      school_years_and_tardies.each { |row| csv << row }
      csv << ['School Year', 'Number of Discipline Incidents']
      school_years_and_discipline_incidents.each { |row| csv << row }

      if mcas_math_results.present?
        csv << []
        csv << ["MCAS Math"]
        csv << ['Date', 'Scale Score', 'Growth', 'Performance Level']
        mcas_math_results.each { |row| csv << row }
      end

      if mcas_ela_results.present?
        csv << []
        csv << ["MCAS English Language Arts"]
        csv << ['Date', 'Scale Score', 'Growth', 'Performance Level']
        mcas_ela_results.each { |row| csv << row }
      end

      if star_math_results.present?
        csv << []
        csv << ["STAR Math"]
        csv << ['Date', 'Math Percentile']
        star_math_results.each { |row| csv << row }
      end

      if star_reading_results.present?
        csv << []
        csv << ["STAR Reading"]
        csv << ['Date', 'Reading Percentile', 'Instructional Reading Level']
        star_reading_results.each { |row| csv << row }
      end
    end
  end

end
