class JsonTransformer

  def transform(file)
    require 'json'
    parsed = JSON.parse(file, symbolize_names: true)
    parsed.each do |row|
      row[:local_id] = row[:local_id].to_s
      if row[:event_date].present?
        row[:event_date] = parse_date(row[:event_date])
      elsif row[:date_taken].present?
        row[:date_taken] = parse_date(row[:date_taken])
      end
    end
  end

  def parse_date(event_date)
    require 'date'
    DateTime.strptime(event_date.to_s,'%s')
  end

end
