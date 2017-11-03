class BehaviorImporter < BaseCsvImporter
  def remote_file_name
    'behavior_export.txt'
  end

  def import_row(row)
    BehaviorRow.build(row).save!
  end
end
