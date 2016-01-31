class StudentRow < Struct.new(:row)

  def self.build(row)
    new(row).build
  end

  def build
    student = Student.find_or_initialize_by(local_id: row[:local_id])

    demographic_attributes = {
      state_id: row[:state_id],
      home_language: row[:home_language],
      program_assigned: row[:program_assigned],
      limited_english_proficiency: row[:limited_english_proficiency],
      sped_placement: row[:sped_placement],
      disability: row[:disability],
      sped_level_of_need: row[:sped_level_of_need],
      plan_504: row[:plan_504],
      student_address: row[:student_address],
      grade: row[:grade],
      registration_date: row[:registration_date],
      free_reduced_lunch: row[:free_reduced_lunch]
    }

    attributes = demographic_attributes.merge(name_view_attributes)
                                       .merge(school_attribute)

    student.assign_attributes(attributes)

    return student
  end

  def name_view_attributes
    name_split = row[:full_name].split(", ")

    case name_split.size
    when 2
      { first_name: name_split[1], last_name: name_split[0] }
    when 1
      { first_name: nil, last_name: name_split[0] }
    end
  end

  def school_attribute
    { school_id: school_rails_id }
  end

  def school_local_id
    row[:school_local_id]
  end

  def school_rails_id
    school_ids_dictionary[school_local_id] if school_local_id.present?
  end

  def school_ids_dictionary
    SchoolLocalIdToAppId.instance.ids_dictionary
  end

end
