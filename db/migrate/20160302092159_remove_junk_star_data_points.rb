# typed: false
class RemoveJunkStarDataPoints < ActiveRecord::Migration[4.2]
  def change
    star = Assessment.find_by_family('STAR')
    star.student_assessments.where(percentile_rank: nil).destroy_all unless star.nil?
  end
end
