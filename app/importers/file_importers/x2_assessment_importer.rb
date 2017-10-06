class X2AssessmentImporter < Struct.new :school_scope, :client, :log, :progress_bar
  # Aspen X2 is the name of Somerville's Student Information System.

  WHITELIST = Regexp.union(/ACCESS/, /WIDA-ACCESS/, /DIBELS/, /MCAS/).freeze

  def import
    @data = Downloader.new(
      log: log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    @data.each.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
      ProgressBar.new(log, remote_file_name, @data.size, index + 1).print if progress_bar
    end
  end

  def remote_file_name
    'assessment_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(school_scope)
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
