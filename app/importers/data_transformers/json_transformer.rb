class JsonTransformer

  def transform(file)
    require 'json'
    parsed = JSON.parse(file, symbolize_names: true)
    cleaned = parsed.select do |object|
      cleaner = JsonObjectCleaner.new(object)
      (cleaner.clean_date? && cleaner.clean_booleans?)
    end
    cleaned.each do |object|
      cleaner = JsonObjectCleaner.new(object)
      cleaner.transform_object
    end
  end

end
