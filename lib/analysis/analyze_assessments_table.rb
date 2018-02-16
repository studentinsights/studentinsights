require 'csv'

class AnalyzeAssessmentsTable < Struct.new(:path)

  def contents
    encoding_options = {
      invalid: :replace,
      undef: :replace,
      replace: ''
    }

    @file ||= File.read(path).encode('UTF-8', 'binary', encoding_options)
                             .gsub(/\\\\/, '')
                             .gsub(/\\"/, '')
  end

  def data
    csv_options = {
      headers: true,
      header_converters: :symbol,
      converters: ->(h) { nil_converter(h) }
    }

    @parsed_csv ||= CSV.parse(contents, csv_options)
  end

  def assessment_subject
    data[:assessment_subject]
  end

  def assessment_subject_summary
    assessment_subject.each_with_object(Hash.new(0)) { |subj, memo| memo[subj] += 1 }
  end

  def assessment_test
    data[:assessment_test]
  end

  def assessment_test_summary
    assessment_test.each_with_object(Hash.new(0)) { |test, memo| memo[test] += 1 }
  end

  def assessment_test_subject_crosstabs
    data.each_with_object(Hash.new(0)) do |row, memo|
      crosstab = [
        row.fetch(:assessment_test, 'NIL'), row.fetch(:assessment_subject, 'NIL')
      ].join('+')

      memo[crosstab] += 1
    end
  end

  def nil_converter(value)
    value unless value == '\N'
  end

  def new_bedford_mcas_dates
    data.select { |row| row[:assessment_test] == 'MCAS' }
        .map { |row| row[:assessment_date] }
        .uniq
        .sort
  end

end
