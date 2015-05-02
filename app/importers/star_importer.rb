require 'csv'

module StarImporter

  def import
    CSV.foreach(star_data_path, headers: true,
                                header_converters: lambda { |h| convert_headers(h) }
                                ) do |row|
      row = row.to_hash.except(nil)
      state_id, date_taken = row['state_identifier'], row['date_taken']
      student = Student.where(state_identifier: state_id).first_or_create!
      star_result = StarResult.where(student_id: student.id, date_taken: date_taken).first_or_create!
      header_dictionary.values.each do |attribute|
        star_result.send(attribute + '=', row[attribute])
        star_result.save!
      end
    end
  end

  def convert_headers(header)
    if id_header_dictionary.keys.include? header
      header = id_header_dictionary[header]
    else
      if header_dictionary.keys.include? header
        header = header_dictionary[header]
      end
    end
  end

  def id_header_dictionary
    { 
      'StateStudentID' => 'state_identifier',
      'DateTaken' => 'date_taken'
    }
  end
end
