class JsonTransformer

  def transform(file)
    require 'json'
    parsed = JSON.parse(file, symbolize_names: true)
    parsed.each do |row|
      transform_row row
    end
  end

  def date_rows
    [ :event_date, :date_taken, :assessment_date ]
  end

  def boolean_rows
    [ :asbence, :tardy, :has_exact_time ]
  end

  def transform_row(row)
    row[:local_id] = row[:local_id].to_s

    # Date rows to datetime
    date_rows.each do |dr|
      if row[dr].present?
        row[dr] = parse_date(row[dr])
      end
    end

    boolean_rows.each do |br|
      if row[br].present?
        row[br] = parse_boolean(row[br])
      end
    end

    return row
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
