class EducatorsImporter

  def remote_file_name
    # Expects a CSV with the following headers, transformed to symbols by CsvTransformer during import:
    #
    # [ "state_id", "local_id", "full_name", "staff_type", "homeroom", "school_local_id"]

    'educators_export.txt'
  end

  def import_row(row)
    educator = Educator.where(local_id: row[:local_id]).first_or_create!

    # Set homeroom
    update_homeroom(educator, row[:homeroom]) if row[:homeroom]

    # Set admin status
    admin_status = (row[:staff_type].present? && row[:staff_type].downcase == "administrator")

    # Look up school ID
    school_id = School.find_by_local_id!(row[:school_local_id]).id if row[:school_local_id].present?

    # Set staff_type, name, and IDs

    # There are many ways to set attributes in ActiveRecord.
    # 'update': saves to db, runs validations, runs callbacks, resets updated_at

    educator.update(
      state_id: row[:state_id],
      local_id: row[:local_id],
      full_name: row[:full_name],
      staff_type: row[:staff_type],
      admin: admin_status,
      school_id: school_id
    )
  end

  def update_homeroom(educator, homeroom_name)
    homeroom = Homeroom.find_by_name!(homeroom_name)
    homeroom.update(educator: educator) if homeroom
  end

end
