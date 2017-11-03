class X2AssessmentImporter < BaseCsvImporter  # Aspen X2 is the name of Somerville's Student Information System.

  WHITELIST = Regexp.union(/ACCESS/, /WIDA-ACCESS/, /DIBELS/, /MCAS/).freeze

  def remote_file_name
    'assessment_export.txt'
  end

  def import_row(row)
    # Expects the following headers:
    #
    #   :state_id, :local_id, :school_local_id, :assessment_date,
    #   :assessment_scale_score, :assessment_performance_level, :assessment_growth,
    #   :assessment_name, :assessment_subject, :assessment_test

    return unless row[:assessment_test].match(WHITELIST)

    row[:assessment_growth] = nil if !/\D/.match(row[:assessment_growth]).nil?
    row[:assessment_test] = "ACCESS" if row[:assessment_test] == "WIDA-ACCESS"

    case row[:assessment_test]
    when 'MCAS'
      McasRow.build(row).save!
    when 'ACCESS'
      AccessRow.build(row).save!
    when 'DIBELS'
      DibelsRow.build(row).save!
    end
  end

end
