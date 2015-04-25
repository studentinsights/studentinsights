require 'csv'

class StarImporter < Struct.new(:star_data_path, :reading_or_math)

  def import
    CSV.foreach(star_data_path, headers: true,
                                header_converters: lambda { |h| convert_headers(h) }
                                ) do |row|
      row = row.to_hash.except(nil)
      state_id, date_taken = row['state_identifier'], row['date_taken']
      student = Student.where(state_identifier: state_id).first_or_create!
      star_result = StarResult.where(student_id: student.id, date_taken: date_taken).first_or_create!
      if reading_or_math == "math"
        math_header_dictionary.values.each do |attribute|
          star_result.send(attribute + '=', row[attribute])
          star_result.save!
        end
      elsif reading_or_math == "reading"
        reading_header_dictionary.values.each do |attribute|
          star_result.send(attribute + '=', row[attribute])
          star_result.save!
        end
      end
    end
  end

  def convert_headers(header)
    if id_header_dictionary.keys.include? header
      header = id_header_dictionary[header]
    else
      if reading_or_math == "math"
        if math_header_dictionary.keys.include? header
          header = math_header_dictionary[header]
        end
      elsif reading_or_math == "reading"
        if reading_header_dictionary.keys.include? header
          header = reading_header_dictionary[header]
        end
      end
    end
  end
  
  def math_header_dictionary
    { 'PR' => 'math_percentile_rank' }
  end

  def reading_header_dictionary
    {
      'PR' => 'reading_percentile_rank',
      'IRL' => 'instructional_reading_level'
    }
  end

  def id_header_dictionary
    { 
      'StateStudentID' => 'state_identifier',
      'DateTaken' => 'date_taken'
    }
  end

end
