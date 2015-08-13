class StudentProfileCsvExporter < Struct.new :student
  include FindDataForStudentProfile

  def assessments
    student.assessments
  end

  def profile_csv_export
    CSV.generate do |csv|
      attendance_section(csv).add
      behavior_section(csv).add
      mcas_math_section(csv).add
      mcas_ela_section(csv).add
      star_math_section(csv).add
      star_reading_section(csv).add
    end
  end

  def attendance_section(csv)
    StudentProfileCsvAttendanceSection.new(csv, self)
  end

  def behavior_section(csv)
    StudentProfileCsvBehaviorSection.new(csv, self)
  end

  def mcas_math_section(csv)
    StudentProfileCsvAssessmentSection.new(
      csv, mcas_math_results(student.assessments), ["MCAS Math"],
      ['Date', 'Scale Score', 'Growth', 'Performance Level'],
      [:date_taken, :scale_score, :growth_percentile, :performance_level]
    )
  end

  def mcas_ela_section(csv)
    StudentProfileCsvAssessmentSection.new(
      csv, mcas_ela_results(student.assessments), ["MCAS English Language Arts"],
      ['Date', 'Scale Score', 'Growth', 'Performance Level'],
      [:date_taken, :scale_score, :growth_percentile, :performance_level]
    )
  end

  def star_math_section(csv)
    StudentProfileCsvAssessmentSection.new(
      csv, star_math_results(student.assessments), ["STAR Math"],
      ['Date', 'Math Percentile'],
      [:date_taken, :percentile_rank]
    )
  end

  def star_reading_section(csv)
    StudentProfileCsvAssessmentSection.new(
      csv, star_math_results(student.assessments), ["STAR Reading"],
      ['Date', 'Reading Percentile', 'Instructional Reading Level'],
      [:date_taken, :percentile_rank, :instructional_reading_level]
    )
  end

end
