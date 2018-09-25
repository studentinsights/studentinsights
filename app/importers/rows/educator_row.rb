class EducatorRow < Struct.new(:row, :homeroom_id, :school_ids_dictionary)
  # Returns a new or existing Educator record matching the row, or nil if it can't
  # understand the row.
  def match_educator_record
    login_name = row[:login_name]
    return nil if login_name.nil? || login_name == ''

    # login_name is the primary key, and email is always secondary
    educator = Educator.find_or_initialize_by(login_name: login_name)
    educator.assign_attributes({
      email: email_from_row,
      state_id: row[:state_id],
      full_name: row[:full_name],
      staff_type: row[:staff_type],
      admin: is_admin?,
      local_id: row[:local_id],
      homeroom_id: homeroom_id,
      school_id: school_rails_id
    })

    # These values are "owned" by Insights and are mutable, so only set defaults
    # for these attributes when creating a new record, don't update over time.
    # They are mutated and overwritten by the Insights permissions UI.
    if educator.new_record?
      educator.assign_attributes({
        schoolwide_access: is_admin?,
        can_view_restricted_notes: is_admin?
      })
    end

    educator
  end

  private

  def email_from_row
    PerDistrict.new.email_from_educator_import_row(row)
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
