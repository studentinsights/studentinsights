module AssessmentScopes
  def mcas_results
    where(assessment_family_id: AssessmentFamily.mcas.id)
  end
  def star_results
    where(assessment_family_id: AssessmentFamily.star.id)
  end
end
