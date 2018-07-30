class AssessmentsReport < Struct.new :log

  def print_report
    log.puts(report)
  end

  private

  def headers
    [
      'Assessments (FROM OLD STUDENT_ASSESSMENTS TABLE):',
      "#{'Family'.ljust(10)}| #{'Subject'.ljust(15)} | Count (All Students)",
      "#{'---'.ljust(10)}| #{'---'.ljust(15)}| #{'---'.ljust(24)} ",
    ]
  end

  def report
    sorted_assessments = Assessment.all.includes(:student_assessments).sort_by(&:family)
    old_table = headers << sorted_assessments.map { |assessment| row(assessment) }

    old_table + [
      # New one-table-per-assessment!
      '',
      'Assessments (FROM NEW ONE-TABLE-PER-ASSESSMENT):',
      "StarMathResult: #{StarMathResult.count}",
      "StarReadingResult: #{StarReadingResult.count}",
    ]
  end

  def row(assessment)
    [
      family_column(assessment),
      subject_column(assessment),
      all_students_column(assessment)
    ].join
  end

  def family_column(assessment)
    "#{assessment.family.ljust(10)}| "
  end

  def subject_column(assessment)
    "#{assessment.subject.to_s.ljust(15)}| "
  end

  def all_students_column(assessment)
    "#{assessment.student_assessments.count.to_s.ljust(24)}"
  end

end
