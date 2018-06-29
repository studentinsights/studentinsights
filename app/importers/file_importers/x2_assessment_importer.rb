class X2AssessmentImporter

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @log = options.fetch(:log)
  end

  WHITELIST = Regexp.union(/ACCESS/, /WIDA-ACCESS/, /DIBELS/, /MCAS/).freeze

  def import
    return unless remote_file_name

    @data = CsvDownloader.new(
      log: @log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    @data.each_with_index do |row, index|
      import_row(row) if filter.include?(row)
      log("processed #{index} rows.") if index % 10000 == 0
    end
  end

  def client
    SftpClient.for_x2
  end

  def remote_file_name
    LoadDistrictConfig.new.remote_filenames.fetch('FILENAME_FOR_ASSESSMENT_IMPORT', nil)
  end

  def data_transformer
    StreamingCsvTransformer.new(@log)
  end

  def filter
    SchoolFilter.new(@school_scope)
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

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "X2AssessmentImporter: #{text}"
  end
end
