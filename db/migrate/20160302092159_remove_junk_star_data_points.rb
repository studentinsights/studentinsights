class RemoveJunkStarDataPoints < ActiveRecord::Migration
  def change
    Assessment.find_by_family('STAR').student_assessments.where(percentile_rank: nil).destroy_all
  end
end
