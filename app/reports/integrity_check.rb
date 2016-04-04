class IntegrityCheck

  def check!
    has_data?
    has_valid_data?
  end

  private

  def has_data?
    raise "no students" unless Student.count > 0
    raise "no schools" unless School.count > 0
    raise "no assesments" unless Assessment.count > 0
    raise "no homerooms" unless Homeroom.count > 0
    raise "no student assessments" unless StudentAssessment.count > 0
    raise "no educators" unless Educator.count > 0
  end

  def has_valid_data?
    StudentAssessment.find_each(&:save!)
    Educator.find_each(&:save!)
    Student.find_each(&:save!)
    StudentSchoolYear.find_each(&:save!)
  end

end
