class StudentRow < Struct.new(:row, :school_ids_dictionary)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  # Some of those rows will enter Student Insights, and the data in the CSV will be written into the database
  # (see name_view_attributes, demographic_attributes, school_attribute).
  #
  # Contrast with student.rb, which is represents a student once they've entered the DB.
  #
  # The `row` CSV object passed quacks like a hash, and the keys are formed from matching the
  # CSV headers.  This means that column order is ignored and all columns will be present as keys.

  def self.build(row)
    new(row).build
  end

  def build
    student = Student.find_or_initialize_by(local_id: row[:local_id])
    student.assign_attributes(attributes)
    return student
  end

  private

  def name_view_attributes
    name_split = row[:full_name].split(", ")

    case name_split.size
    when 2
      { first_name: name_split[1], last_name: name_split[0] }
    when 1
      { first_name: nil, last_name: name_split[0] }
    end
  end

  def attributes
    demographic_attributes
      .merge(name_view_attributes)
      .merge(school_attributes)
      .merge(per_district_attributes)
  end

  def demographic_attributes
    {
      state_id: row[:state_id],
      enrollment_status: row[:enrollment_status],
      home_language: row[:home_language],
      program_assigned: row[:program_assigned],
      limited_english_proficiency: row[:limited_english_proficiency],
      sped_placement: row[:sped_placement],
      disability: row[:disability],
      sped_level_of_need: row[:sped_level_of_need],
      plan_504: row[:plan_504],
      student_address: row[:student_address],
      grade: grade,
      registration_date: row[:registration_date],
      free_reduced_lunch: row[:free_reduced_lunch],
      date_of_birth: row[:date_of_birth],
      race: row[:race],
      hispanic_latino: row[:hispanic_latino],
      gender: row[:gender],
      primary_phone: row[:primary_phone],
      primary_email: row[:primary_email]
    }
  end

  def school_attributes
    { school_id: school_rails_id }
  end

  def school_local_id
    row[:school_local_id]
  end

  def school_rails_id
    school_ids_dictionary[school_local_id] if school_local_id.present?
  end

  def grade
    # "08" => "8"
    # "KF" => "KF"

    return row[:grade] if row[:grade].to_i == 0
    row[:grade].to_i.to_s
  end

  # These are different based on the district configuration and export
  def per_district_attributes
    included_attributes = {}
    per_district = PerDistrict.new

    if per_district.import_student_house?
      included_attributes.merge!(house: row[:house])
    end

    if per_district.import_student_counselor?
      counselor_last_name = if row[:counselor] then row[:counselor].split(",")[0] else nil end
      included_attributes.merge!(counselor: counselor_last_name)
    end

    if per_district.import_student_sped_liason?
      included_attributes.merge!(sped_liason: row[:sped_liason])
    end

    included_attributes
  end
end
