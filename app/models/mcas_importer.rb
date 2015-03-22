require 'csv'

class McasImporter < Struct.new(:mcas_data_path)

  def import
    CSV.foreach(mcas_data_path, headers: true,
                                header_converters: lambda { |h| convert_headers(h) }
                                ) do |row|
      row = row.to_hash.except(nil)
      Student.create! row
    end
  end

  def convert_headers(header)
    if header_dictionary.keys.include? header
      return header_dictionary[header]
    end
  end

  def header_dictionary
    {
      "escaleds" => :ela_scaled,
      "eperf2" => :ela_performance,
      "esgp" => :ela_growth,
      "mscaleds" => :math_scaled,
      "mperf2" => :math_performance,
      "msgp" => :math_growth,
      "sasid" => :state_identifier,
      "firstname" => :first_name, 
      "lastname" => :last_name,
      "grade" => :grade,
      "race_off" => :race,
      "freelunch_off" => :low_income,
      "sped_off" => :sped,
      "lep_off" => :limited_english_proficient,
      "flep_off" => :former_limited_english_proficient
    }
  end

end