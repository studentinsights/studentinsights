module FindDataForStudentProfile
  def scope_assessments(assessments_to_scope, family, subject)
    unless family.is_a?(MissingAssessmentFamily) || subject.is_a?(MissingAssessmentSubject)
      assessments_to_scope.where(
        assessment_family_id: family.id,
        assessment_subject_id: subject.id
      ).order(date_taken: :desc)
    end
  end

  def mcas_math_results(assessments_to_scope)
    scope_assessments(assessments_to_scope, AssessmentFamily.mcas, AssessmentSubject.math)
  end

  def mcas_ela_results(assessments_to_scope)
    scope_assessments(assessments_to_scope, AssessmentFamily.mcas, AssessmentSubject.ela)
  end

  def star_math_results(assessments_to_scope)
    scope_assessments(assessments_to_scope, AssessmentFamily.star, AssessmentSubject.math)
  end

  def star_reading_results(assessments_to_scope)
    scope_assessments(assessments_to_scope, AssessmentFamily.star, AssessmentSubject.reading)
  end

  def attendance_events_by_school_year
    student.attendance_events.sort_by_school_year
  end

  def discipline_incidents_by_school_year
    student.discipline_incidents.sort_by_school_year
  end

  def attendance_events_school_years
    attendance_events_by_school_year.keys.reverse
  end

  def behavior_events_school_years
    discipline_incidents_by_school_year.keys.reverse
  end

end
