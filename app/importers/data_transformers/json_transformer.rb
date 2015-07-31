class JsonTransformer

  def transform(file)
    require 'json'
    parsed = JSON.parse(file, symbolize_names: true)
    parsed.each do |row|
      transform_row row
    end
  end

  def transform_row(row)
    row[:local_id] = row[:local_id].to_s

    # Date rows to datetime
    if row[:event_date].present?
      row[:event_date] = parse_date(row[:event_date])
    elsif row[:date_taken].present?
      row[:date_taken] = parse_date(row[:date_taken])
    end

    # Boolean rows to boolean
    if row[:asbence].present?
      row[:asbence] = parse_boolean(row[:asbence])
    end
    if row[:tardy].present?
      row[:tardy] = parse_boolean(row[:tardy])
    end
    if row[:has_exact_time].present?
      row[:has_exact_time] = parse_boolean(row[:has_exact_time])å
    end
  end

  def parse_date(event_date)
    require 'date'
    DateTime.strptime(event_date.to_s,'%s')
  end

  def parse_boolean(value)
    case value
    when "1"
      true
    when "0"
      false
    else
      nil
    end
  end

end
