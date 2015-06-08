class McasImporter
  include X2Importer

  def export_file_name
    'assessment_export.txt'
  end

  def import_row(row)
    student = Student.where(state_id: row[:state_id]).first_or_create!
    mcas_result = McasResult.where(
      # Data goes here
    ).first_or_create!
  end
end
