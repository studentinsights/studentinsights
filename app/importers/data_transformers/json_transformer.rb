class JsonTransformer

  def transform(file)
    require 'json'
    parsed = JSON.parse(file, symbolize_names: true)
    cleaned = parsed.select { |row| clean_date_row(row) && clean_boolean_row(row) }
    transformed = cleaned.each { |row| transform_row(row) }
  end

  def transform_row(row)
    row[:local_id] = row[:local_id].to_s
    if has_dates(row)
      date_header = (row.keys & date_keys)[0]
      row[date_header] = parse_date(row[date_header])
    end
    if has_booleans(row)
      these_boolean_headers = row.keys & boolean_keys
      these_boolean_headers.each do |b|
        row[b] = parse_boolean(row[b])
      end
    end
    return row
  end

  def clean_date_row(row)
    return true unless has_dates(row)
    date_header = (row.keys & date_keys)[0]
    is_parsable_date(row[date_header])
  end

  def clean_boolean_row(row)
    return true unless has_booleans(row)
    result = true
    these_boolean_headers = row.keys & boolean_keys
    these_boolean_headers.each do |b|
      if !is_parsable_boolean(row[b])
        result = false
      end
    end
    return result
  end

  def date_keys
    [:event_date, :date_taken, :assessment_date]
  end

  def boolean_keys
    [:asbence, :tardy, :has_exact_time]
  end

  def has_dates(row)
    (row.keys & date_keys).present?
  end

  def has_booleans(row)
    (row.keys & boolean_keys).present?
  end

  def is_parsable_boolean(value)
    [true, false, '1', '0', 1, 0, 'true', 'false'].include? value
  end

  def is_parsable_date(value)
    require 'date'
    DateTime.strptime(value.to_s,'%s')
  rescue ArgumentError
    false
  end

  def parse_boolean(value)
    case value
    when "1", 1
      true
    when "0", 0
      false
    else
      nil
    end
  end

  def parse_date(event_date)
    require 'date'
    DateTime.strptime(event_date.to_s,'%s')
  rescue ArgumentError
    nil
  end

end
