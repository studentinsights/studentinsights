class RemoveInvalidAccessAssessments < ActiveRecord::Migration[4.2]
  def change
    access_ell_assessment = Assessment.find_by_family_and_subject('ACCESS', 'ELL')
    access_ell_assessment.destroy! unless access_ell_assessment.nil?
    access_overall_assessment = Assessment.find_by_family_and_subject('ACCESS', 'Overall')
    access_overall_assessment.destroy! unless access_overall_assessment.nil?
  end
end
