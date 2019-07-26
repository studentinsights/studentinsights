# typed: true
class ConsolidateDibelsIntoOneAssessment < ActiveRecord::Migration[4.2]
  def change
    if Assessment.where(family: 'DIBELS').count > 1
      one_true_assessment = Assessment.find_or_create_by!(family: 'DIBELS', subject: nil)
      dibels_student_assessments = StudentAssessment.joins(:assessment)
                                                    .where(assessments: { family: 'DIBELS' })

      dibels_student_assessments.each do |student_assessment|
        student_assessment.update(assessment: one_true_assessment)
      end

      Assessment.where(family: 'DIBELS').where.not(subject: nil).destroy_all
    end
  end
end
