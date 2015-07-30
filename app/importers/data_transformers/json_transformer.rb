class JsonTransformer

  def transform(file)
    require 'json'
    parsed = JSON.parse(file, symbolize_names: true)
    parsed.each { |row| row[:local_id] = row[:local_id].to_s }
  end

end
