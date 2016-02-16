require 'csv'

class StudentProfileCsvExporter < Struct.new :student

  def school_years_and_absences
    student.student_school_years.map do |student_school_year|
      [ student_school_year.school_year.name, student_school_year.absences.count ]
    end
  end

  def school_years_and_tardies
    student.student_school_years.map do |student_school_year|
      [ student_school_year.school_year.name, student_school_year.tardies.count ]
    end
  end

  def school_years_and_discipline_incidents
    student.student_school_years.map do |student_school_year|
      [ student_school_year.school_year.name, student_school_year.discipline_incidents.count ]
    end
  end

  def mcas_mathematics_results
    student.mcas_mathematics_results.map do |result|
      [
        result.date_taken,
        result.scale_score,
        result.growth_percentile,
        result.performance_level
      ]
    end
  end

  def mcas_ela_results
    student.mcas_ela_results.map do |results|
      [
        result.date_taken,
        result.scale_score,
        result.growth_percentile,
        result.performance_level
      ]
    end
  end

  def star_math_results
    student.star_math_results.map do |result|
      [result.date_taken, result.percentile_rank]
    end
  end

  def star_reading_results
    student.star_reading_results.map do |results|
      [result.date_taken, result.percentile_rank, result.instructional_reading_level]
    end
  end

  def demographic_row
    [
      ['Demographics'],
      ['Program Assigned', student.program_assigned],
      ['504 Plan', student.plan_504],
      ['Placement', student.sped_placement],
      ['Disability', student.disability],
      ['Level of Need', student.sped_level_of_need],
      ['Language Fluency', student.limited_english_proficiency],
      ['Home Language', student.home_language],
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

      if mcas_mathematics_results.present?
        csv << []
        csv << ["MCAS Mathematics"]
        csv << ['Date', 'Scale Score', 'Growth', 'Performance Level']
        mcas_mathematics_results.each { |row| csv << row }
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
