class EducatorsImporter < BaseCsvImporter
  def remote_file_name
    'educators_export.txt'
  end

  def school_ids_dictionary
    @dictionary ||= School.all.map { |school| [school.local_id, school.id] }.to_h
  end

  def import_row(row)
    educator = EducatorRow.new(row, school_ids_dictionary).build

    if educator.present?
      educator.save!

      homeroom = Homeroom.find_by_name(row[:homeroom]) if row[:homeroom]
      homeroom.update(educator: educator) if homeroom.present?
    end
  end

end
