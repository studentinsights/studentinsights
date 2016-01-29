class EducatorsImporter

  def remote_file_name
    # Expects a CSV with the following headers, transformed to symbols by CsvTransformer during import:
    #
    # [ "state_id", "local_id", "full_name", "staff_type", "homeroom", "school_local_id"]

    'educators_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def import_row(row)
    homeroom = Homeroom.find_by_name!(row[:homeroom]) if row[:homeroom].present?
    educator = EducatorRow.build(row)

    return unless homeroom.present? || educator.admin?

    educator.save!
    homeroom.update(educator: educator) if homeroom.present?
  end

end
