class StudentAssessmentImporter
  include Importer

  def remote_file_name
    # Expects a CSV with the following headers, transformed to symbols by CsvTransformer during import:
    #
    # [ "state_id", "local_id", "school_local_id", "assessment_date",
    #   "assessment_scale_score", "assessment_performance_level", "assessment_growth",
    #   "assessment_name", "assessment_subject", "assessment_test" ]

    'assessment_export.txt'
  end

  def assessment_white_list
    ["ACCESS", "WIDA-ACCESS", "DIBELS", "MCAS", "MAP", "MELA-O", "MEPA", "STAR"]
  end

  def check_white_list(row)
    name = row[:assessment_test]
    pass = false
    assessment_white_list.each do |assessment|
      pass = true if name.include? assessment
    end
    return pass
  end

  def import_row(row)
    return unless check_white_list(row)
    standardize_access_test_names(row)
    chuck_non_numerical_growth_scores(row)

    student = Student.where(local_id: row[:local_id]).first_or_create!
    assessment = Assessment.where(
      subject: row[:assessment_subject],
      family: row[:assessment_test]
    ).first_or_create!

    result = StudentAssessment.where(
      student_id: student.id,
      date_taken: row[:assessment_date],
      assessment_id: assessment.id
    ).first_or_create!

    result.update_attributes(
      scale_score: row[:assessment_scale_score],
      performance_level: row[:assessment_performance_level],
      growth_percentile: row[:assessment_growth]
    )
  end

  def standardize_access_test_names(row)
    if row[:assessment_test] == "WIDA-ACCESS"
      row[:assessment_test] = "ACCESS"
    end
  end

  def chuck_non_numerical_growth_scores(row)
    if !/\D/.match(row[:assessment_growth]).nil?
      row[:assessment_growth] = nil
    end
  end
end
