require 'csv'

class McasImporter < Struct.new(:mcas_data_path, :school, :grade, :year)

  def import
    assessment = Assessment.where(name: 'MCAS', year: year).first_or_create!
    CSV.foreach(mcas_data_path, headers: true,
                                header_converters: lambda { |h| convert_headers(h) }
                                ) do |row|
      row = row.to_hash.except(nil)
      row = look_up_school(row)
      if row['grade'] == grade && row['school_id'] == school.id
        student = Student.where(state_identifier: row['state_identifier']).first_or_create!

        (demographic_attrs + id_attrs).each do |attribute|
          student.send(attribute + '=', row[attribute])
          student.save!
        end

        result = StudentResult.where(student_id: student.id, assessment_id: assessment.id).first_or_create!
        student_result_attrs.each do |attribute|
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
      'sasid' => 'state_identifier',
      'firstname' => 'first_name',
      'lastname' => 'last_name',
      'grade' => 'grade',
      'schname' => 'school_name',
      'race_off' => 'race',
      'freelunch_off' => 'low_income',
      'sped_off' => 'sped',
      'lep_off' => 'limited_english_proficient',
      'flep_off' => 'former_limited_english_proficient'
    }
  end

  def student_result_attrs
    [ 'ela_scaled', 'ela_performance', 'ela_growth', 
      'math_scaled', 'math_performance', 'math_growth' ]
  end

  def demographic_attrs
    [ 'race', 'low_income', 'sped', 'limited_english_proficient',
      'former_limited_english_proficient' ]
  end

  def id_attrs
    [ 'state_identifier', 'first_name', 'last_name', 'grade' ]
  end

  def look_up_school(row)
    school_name = row['school_name']
    school = School.find_by_name(school_name)
    if school.present?
      row['school_id'] = school.id
    end
    return row.except('school_name')
  end

end