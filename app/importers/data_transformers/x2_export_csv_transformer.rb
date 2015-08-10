class X2ExportCsvTransformer
  require 'csv'

  def transform(file)
    csv = CSV.parse(file, headers: true, header_converters: :symbol, converters: lambda { |h| nil_converter(h) })
    clean_date_rows(csv) if (csv.headers & date_headers).present?
    clean_boolean_rows(csv) if (csv.headers & boolean_headers).present?
    return csv
  end

  def nil_converter(value)
    value == '\N' ? nil : value
  end

  def clean_date_rows(csv)
    date_header = (csv.headers & date_headers)[0]
    csv.delete_if do |row|
      !is_parsable_date(row[date_header])
    end
  end

  def clean_boolean_rows(csv)
    these_boolean_headers = csv.headers & boolean_headers
    these_boolean_headers.each do |b|
      csv.delete_if do |row|
        !is_parsable_boolean(row[b])
      end
    end
  end

  def date_headers
    [:event_date, :date_taken, :assessment_date]
  end

  def boolean_headers
    [:absence, :tardy, :has_exact_time]
  end

  def is_parsable_boolean(value)
    [true, false, '1', '0', 1, 0, 'true', 'false'].include? value
  end

  def is_parsable_date(value)
    return false if value.blank?
    value.is_a?(DateTime) || Date.parse(value)
  rescue ArgumentError
    false
  end

end
