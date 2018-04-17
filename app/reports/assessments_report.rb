class AssessmentsReport < Struct.new :log

  def print_report
    log.puts(report)
  end

  private

  def headers
    [
      'Assessments:',
      '',
      "#{'Family'.ljust(10)}| #{'Subject'.ljust(15)}| Count (Active Students) | Count (All Students)",
      "#{'---'.ljust(10)}| #{'---'.ljust(15)}| #{'---'.ljust(24)}| #{'---'.ljust(24)} ",
    ]
  end

  def report
    headers << Assessment.all.sort_by(&:family).map { |assessment| row(assessment) }
  end

  def row(assessment)
    [
      family_column(assessment), subject_column(assessment),
      active_students_column(assessment), all_students_column(assessment) ].join
  end

  def family_column(assessment)
    "#{assessment.family.ljust(10)}| "
  end

  def subject_column(assessment)
    "#{assessment.subject.to_s.ljust(15)}| "
  end

  def active_students_count(assessment)
    Student.active.inject(0) do |sum, student|
      sum + student.student_assessments.where(assessment: assessment).count
    end
  end

  def active_students_column(assessment)
    "#{active_students_count(assessment).to_s.ljust(24)}| "
  end

  def all_students_column(assessment)
    "#{assessment.student_assessments.count.to_s.ljust(24)}"
  end

end
