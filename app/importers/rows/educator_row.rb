class EducatorRow < Struct.new(:row, :school_ids_dictionary)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  #
  def self.build(row)
    new(row).build
  end

  def build
    return nil if row[:login_name].nil? || row[:login_name] == ''

    # TODO: find_or_initialize on login_name once all active educators
    # have a login_name set.
    educator = Educator.find_or_initialize_by(email: email)

    educator.assign_attributes(
      login_name: row[:login_name],
      state_id: row[:state_id],
      full_name: row[:full_name],
      staff_type: row[:staff_type],
      admin: is_admin?,
      local_id: row[:local_id],
      school_id: school_rails_id
    )

    if educator.new_record? && is_admin?
      educator.assign_attributes({
        schoolwide_access: true,
        can_view_restricted_notes: true,
      })
    end

    return educator
  end

  private

  def email
    PerDistrict.new.from_import_login_name_to_email(row[:login_name], row[:full_name])
  end

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
