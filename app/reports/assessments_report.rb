class AssessmentsReport

  def print_report
    puts report
  end

  def headers
    [
      'Assessments:',
      '',
      'Family | Subject | Count',
      '--- | --- | ---',
    ]
  end

  def report
    headers << Assessment.all.sort_by(&:family).map do |assessment|
      "#{assessment.family} | #{assessment.subject} | #{assessment.student_assessments.count}"
    end
  end

end
