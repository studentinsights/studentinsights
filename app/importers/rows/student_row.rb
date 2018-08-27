class StudentRow < Struct.new(:row, :homeroom_id, :school_ids_dictionary, :log)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  # Some of those rows will enter Student Insights, and the data in the CSV will be written into the database.
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
    student
  end

  private

  def attributes
    demographic_attributes
      .merge(name_attributes)
      .merge(school_attributes)
      .merge(per_district_attributes)
      .merge({ grade: grade })
      .merge({ homeroom_id: homeroom_id })
  end

  def name_attributes
    name_split = row[:full_name].split(", ")

    case name_split.size
    when 2
      { first_name: name_split[1], last_name: name_split[0] }
    when 1
      { first_name: nil, last_name: name_split[0] }
    end
  end

  def demographic_attributes
    row.to_h.slice(
      :state_id,
      :enrollment_status,
      :home_language,
      :program_assigned,
      :limited_english_proficiency,
      :sped_placement,
      :disability,
      :sped_level_of_need,
      :plan_504,
      :student_address,
      :registration_date,
      :free_reduced_lunch,
      :date_of_birth,
      :race,
      :hispanic_latino,
      :gender,
      :primary_phone,
      :primary_email,
    )
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

    if per_district.import_student_sped_liaison?
      included_attributes.merge!(sped_liaison: row[:sped_liaison])
    end

    included_attributes
  end
end
