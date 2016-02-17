class CsvRowCleaner < Struct.new :row

  def dirty_data?
    !clean_date? || !clean_booleans?
  end

  def transform_row
    row[date_header] = parsed_date if has_dates?
    row
  end

  def clean_date?
    return true if date_header.blank?       # <= No dates here, so no more checks to do
    return false if date_from_row.blank?    # <= Column that should be a date is blank
    return false unless parsed_date         # <= Column can't be parsed
    return false if date_out_of_range       # <= Column is out of range
    return true                             # <= Column is a parsable, reasonable date
  end

  def clean_booleans?
    return true if boolean_headers.blank?
    boolean_headers.all? do |header|
      row[header].in? [true, false, '1', '0', 1, 0, 'true', 'false']
    end
  end

  private

  def headers
    row.headers
  end

  def date_headers
    [:event_date, :date_taken, :assessment_date]
  end

  def date_header
    headers.detect { |header| header.in? date_headers }
  end

  def date_from_row
    row[date_header]
  end

  def parsed_date
    return date_from_row if date_from_row.is_a?(DateTime)
    Date.parse(date_from_row)
  rescue ArgumentError
    false
  end

  def date_out_of_range
    (parsed_date < (Date.today - 50.years)) || (Date.today < parsed_date)
  end

  def has_dates?
    headers.any? { |header| header.in? date_headers }
  end

  def boolean_header_names
    [:absence, :tardy, :has_exact_time]
  end

  def boolean_headers
    headers.select { |header| header.in? boolean_header_names }
  end

end
