require 'csv'

class McasImporter < Struct.new :mcas_data_path, :school_scope, :date_taken

  def import
    CSV.foreach(mcas_data_path, headers: true,
                                header_converters: lambda { |h| convert_headers(h) }
                                ) do |row|
      row = row.to_hash.except(nil)
      row = look_up_school(row)
      if row['school_id'] == school_scope.id
        student = Student.where(state_id: row['state_id']).first_or_create!
        (demographic_attrs + id_attrs).each do |attribute|
          student.send(attribute + '=', row[attribute])
          student.save!
        end
        result = McasResult.where(student_id: student.id, date_taken: date_taken).first_or_create!
        mcas_result_attrs.each do |attribute|
          result.send(attribute + '=', row[attribute])
          result.save!
        end
      end
    end
  end

  def convert_headers(header)
    if header_dictionary.keys.include? header
      return header_dictionary[header]
    end
  end

  def header_dictionary
    {
      'escaleds' => 'ela_scaled',
      'eperf2' => 'ela_performance',
      'esgp' => 'ela_growth',
      'mscaleds' => 'math_scaled',
      'mperf2' => 'math_performance',
      'msgp' => 'math_growth',
      'sasid' => 'state_id',
      'grade' => 'grade',
      'school' => 'school_state_id',
      'race_off' => 'race',
      'freelunch_off' => 'low_income',
      'sped_off' => 'sped',
      'lep_off' => 'limited_english_proficient',
      'flep_off' => 'former_limited_english_proficient'
    }
  end

  def mcas_result_attrs
    [ 'ela_scaled', 'ela_performance', 'ela_growth', 
      'math_scaled', 'math_performance', 'math_growth' ]
  end

  def demographic_attrs
    [ 'race', 'low_income', 'sped', 'limited_english_proficient',
      'former_limited_english_proficient' ]
  end

  def id_attrs
    [ 'state_id', 'grade' ]
  end

  def look_up_school(row)
    school_state_id = row['school_state_id']
    school = School.find_by_state_id(school_state_id)
    if school.present?
      row['school_id'] = school.id
    end
    return row.except('school_state_id')
  end

end