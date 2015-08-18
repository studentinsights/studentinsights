class MissingAssessment
  def last_or_missing; MissingStudentAssessment.new end
  def order_or_missing; self end
  def student_assessments; self end
  def find_by_student(student); self end
  def ela; self end
  def math; self end
  def reading; self end
  def star; self end
  def mcas; self end
  def group_by; self end
end
