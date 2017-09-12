class JsonObjectCleaner < Struct.new :json_object

  def clean_date?
    return true unless has_dates
    date_header = (json_object.keys & date_keys)[0]
    is_parsable_date(json_object[date_header])
  end

  def clean_booleans?
    return true unless has_booleans
    result = true
    these_boolean_headers = json_object.keys & boolean_keys
    these_boolean_headers.each do |b|
      if !is_parsable_boolean(json_object[b])
        result = false
      end
    end
    return result
  end

  def has_dates
    (json_object.keys & date_keys).present?
  end

  def has_booleans
    (json_object.keys & boolean_keys).present?
  end

  def date_keys
    [:event_date, :date_taken, :assessment_date]
  end

  def boolean_keys
    [:asbence, :tardy, :has_exact_time]
  end

  def transform_object
    json_object[:local_id] = json_object[:local_id].to_s
    if has_dates
      date_header = (json_object.keys & date_keys)[0]
      json_object[date_header] = parse_date(json_object[date_header])
    end
    if has_booleans
      these_boolean_headers = json_object.keys & boolean_keys
      these_boolean_headers.each do |b|
        json_object[b] = parse_boolean(json_object[b])
      end
    end
    return json_object
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
