class EducatorsImporter
  include Connector
  include Importer

  def remote_file_name
    # Expects a CSV with the following headers, transformed to symbols by CsvTransformer during import:
    #
    # [ "state_id", "local_id", "full_name", "staff_type", "homeroom" ]

    'educators_export.txt'
  end

  def import_row(row)
    educator = Educator.where(local_id: row[:local_id]).first_or_create!
    attributes = Hash[row].except(:homeroom)
    update_homeroom(educator, row[:homeroom]) if row[:homeroom]
    educator.update_attributes(attributes)
  end

  def update_homeroom(educator, homeroom_name)
    homeroom = Homeroom.find_by_name!(homeroom_name)
    homeroom.update(educator: educator) if homeroom
  end

end
