class StudentAssessmentImporter

  def remote_file_name
    # Expects a CSV with the following headers, transformed to symbols by CsvTransformer during import:
    #
    # [ "state_id", "local_id", "school_local_id", "assessment_date",
    #   "assessment_scale_score", "assessment_performance_level", "assessment_growth",
    #   "assessment_name", "assessment_subject", "assessment_test" ]

    'assessment_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def import_row(row)
    return unless assessment_name_inclues_whitelisted_name(row)
    student_assessment = StudentAssessmentRow.build(row)
    student_assessment.save!
  end

  def assessment_name_inclues_whitelisted_name(row)
    assessment_whitelist.any? do |name|
      name.in? row[:assessment_test]
    end
  end

  def assessment_whitelist
    ["ACCESS", "WIDA-ACCESS", "DIBELS", "MCAS", "MAP", "MELA-O", "MEPA", "STAR"]
  end

end
