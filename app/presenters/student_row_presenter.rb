class StudentRowPresenter < Struct.new :row

  def method_missing(message, *args, &block)
    row_value = row[message.to_s]
    row_value.nil? ? "–" : row_value
  end

  def full_name
    first_name = row['first_name']
    last_name = row['last_name']

    if first_name.present? && last_name.present?
      first_name + " " + last_name
    else
      first_name || last_name
    end
  end

end
