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

  def models_to_check
    [StudentAssessment, Assessment, Educator, Student]
  end

  def has_valid_data?
    models_to_check.each do |model|
      puts "Validating #{model.to_s.pluralize}..."
      model.find_each(&:save!)
    end
  end

end
