class StudentAssessmentImporter
  WHITELIST = Regexp.union(/ACCESS/, /WIDA-ACCESS/, /DIBELS/, /MCAS/, /MAP/, /MELA-O/, /MEPA/).freeze

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
    return unless row[:assessment_test].match(WHITELIST)
    StudentAssessmentRow.build(row).save!
  end

end
