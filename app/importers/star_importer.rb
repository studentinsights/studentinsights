require 'csv'

class StarImporter < Struct.new(:star_data_path, :year, :reading_or_math)

  def import
    assessment = Assessment.where(name: 'STAR', year: year).first_or_create!

    CSV.foreach(star_data_path, headers: true,
                                header_converters: lambda { |h| convert_headers(h) }
                                ) do |row|
      row = row.to_hash.except(nil)
      student = Student.where(state_identifier: row['state_identifier']).first_or_create!
      star_result = StarResult.where(
        student_id: student.id, 
        assessment_id: assessment.id).first_or_create!
      if reading_or_math == "math"
        math_attrs.each do |attribute|
          star_result.send(attribute + '=', row[attribute])
          star_result.save!
        end
      elsif reading_or_math == "reading"
        reading_attrs.each do |attribute|
          star_result.send(attribute + '=', row[attribute])
          star_result.save!
        end
      end
    end
  end

  def convert_headers(header)
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

  def math_header_dictionary
    {
      'StateStudentID' => 'state_identifier',
      'PR' => 'math_percentile_rank'
    }
  end

  def reading_header_dictionary
    {
      'StateStudentID' => 'state_identifier',
      'PR' => 'reading_percentile_rank',
      'IRL' => 'instructional_reading_level'
    }
  end

  def math_attrs
    [ 'math_percentile_rank' ]
  end

  def reading_attrs
    [ 'reading_percentile_rank', 'instructional_reading_level' ]
  end
end
