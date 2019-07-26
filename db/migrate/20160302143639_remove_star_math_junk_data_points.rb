# typed: false
class RemoveStarMathJunkDataPoints < ActiveRecord::Migration[4.2]
  def change
    star_math = Assessment.find_by_family_and_subject('STAR', 'Mathematics')
    star_reading = Assessment.find_by_family_and_subject('STAR', 'Reading')

    star_math.student_assessments.where(percentile_rank: nil).destroy_all unless star_math.nil?
    star_reading.student_assessments.where(percentile_rank: nil).destroy_all unless star_reading.nil?
  end
end
