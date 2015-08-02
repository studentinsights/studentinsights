module FindAssessments
  def find_assessments(family, subject)
    unless family.is_a?(MissingAssessmentFamily) || subject.is_a?(MissingAssessmentSubject)
      student.assessments.where(
        assessment_family_id: family.id,
        assessment_subject_id: subject.id
      ).order(date_taken: :desc)
    end
  end

  def mcas_math_results
    find_assessments(AssessmentFamily.mcas, AssessmentSubject.math)
  end

  def mcas_ela_results
    find_assessments(AssessmentFamily.mcas, AssessmentSubject.ela)
  end

  def star_math_results
    find_assessments(AssessmentFamily.star, AssessmentSubject.math)
  end

  def star_reading_results
    find_assessments(AssessmentFamily.star, AssessmentSubject.reading)
  end

  def attendance_events
    student.attendance_events.sort_by_school_year
  end

  def discipline_incidents
    student.discipline_incidents.sort_by_school_year
  end
end
