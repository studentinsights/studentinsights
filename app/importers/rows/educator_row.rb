class EducatorRow < Struct.new(:row, :school_ids_dictionary)
  # Expects a CSV with the following headers:
  #
  # :state_id, :local_id, :full_name, :staff_type, :homeroom, :school_local_id

  def self.build(row)
    new(row).build
  end

  def build
    educator = Educator.find_or_initialize_by(local_id: row[:local_id])

    educator.assign_attributes(
      state_id: row[:state_id],
      full_name: row[:full_name],
      staff_type: row[:staff_type],
      admin: is_admin?,
      email: row[:login_name] + '@k12.somerville.ma.us',
      school_id: school_rails_id
    )

    educator.assign_attributes(schoolwide_access: true) if educator.new_record? && is_admin?

    return educator
  end

  private

  def is_admin?
    row[:staff_type].present? && row[:staff_type] == 'Administrator'
  end

  def school_local_id
    row[:school_local_id]
  end

  def school_rails_id
    school_ids_dictionary[school_local_id] if school_local_id.present?
  end

end
