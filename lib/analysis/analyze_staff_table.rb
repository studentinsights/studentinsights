require 'csv'

class AnalyzeStaffTable < Struct.new(:path)

  def contents
    encoding_options = {
      invalid: :replace,
      undef: :replace,
      replace: ''
    }

    @file ||= File.read(path).encode('UTF-8', 'binary', encoding_options)
                             .gsub(/\\\\/, '')
                             .gsub(/\\"/, '')
  end

  def data
    csv_options = {
      headers: true,
      header_converters: :symbol,
      converters: ->(h) { nil_converter(h) }
    }

    @parsed_csv ||= CSV.parse(contents, csv_options)
  end

  def nil_converter(value)
    value unless value == '\N'
  end

  def get_educator_data_by_full_name(full_name)
    data.select { |row| row[:stf_name_view] == full_name }[0].to_hash
  end

  def get_educators_missing_local_ids
    data.select { |row| row[:stf_id_local].nil? }
        .map { |row| row[:stf_name_view] }
        .sort
  end

end
