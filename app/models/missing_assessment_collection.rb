class MissingAssessmentCollection
  def last_or_missing; MissingAssessment.new end
  def order(order); MissingAssessmentCollection.new end
  def find_by_student(student); MissingAssessmentCollection.new end
  def ela; self end
  def math; self end
  def reading; self end
  def star; self end
  def mcas; self end
end
