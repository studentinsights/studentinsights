# typed: true
class RemoveMcasAssessmentSubjectsNotBeingUsed < ActiveRecord::Migration[4.2]
  def change
    Assessment.where(family: 'MCAS', subject: ['Science', 'Arts', 'Technology']).destroy_all
  end
end
