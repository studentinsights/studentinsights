require 'csv'

# For exporting nested json as a flat CSV
class FlatExporter
  def csv_string(json_rows)
    return '' if json_rows.size == 0
    row_hashes = json_rows.map {|row| flatten(row) }

    header_row = row_hashes.first.keys # all rows should have the same shape
    body_rows = row_hashes.map {|row_hash| row_hash.values }
    ([header_row] + body_rows).map {|row| row.to_csv }.join('')
  end

  def flatten(row, options = {})
    flat = {}
    prefix = options.fetch(:prefix, nil)
    row.keys.each do |key|
      flat_key = [prefix, key].compact.join('.')
      value = row[key]
      if value.is_a?(Hash)
        flat.merge!(flatten(row[key], prefix: flat_key))
      else
        flat[flat_key] = value
      end
    end
    flat
  end
end
