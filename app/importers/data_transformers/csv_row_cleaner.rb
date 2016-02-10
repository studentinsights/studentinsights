class CsvRowCleaner < Struct.new :csv_row

  def transform_row
    csv_row[date_header] = DateTime.parse(csv_row[date_header]) if has_dates?
    csv_row
  end

  def clean_date?
    date_header = (csv_row.headers & date_headers)[0]
    return true unless date_header.present?
    is_parsable_date(csv_row[date_header])
  end

  def clean_booleans?
    these_boolean_headers = csv_row.headers & boolean_headers
    return true unless these_boolean_headers.present?
    result = true
    these_boolean_headers.each do |b|
      result = false if !is_parsable_boolean(csv_row[b])
    end
    return result
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

  private

  def headers
    csv_row.headers
  end

  def date_headers
    [:event_date, :date_taken, :assessment_date]
  end

  def boolean_headers
    [:absence, :tardy, :has_exact_time]
  end

  def has_dates?
    headers.any? { |header| header.in? date_headers }
  end

  def date_header
    headers.detect { |header| header.in? date_headers }
  end

end
