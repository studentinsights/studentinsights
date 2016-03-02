class RemoveMcasAssessmentSubjectsNotBeingUsed < ActiveRecord::Migration
  def change
    Assessment.where(family: 'MCAS', subject: ['Science', 'Arts', 'Technology']).destroy_all
  end
end
