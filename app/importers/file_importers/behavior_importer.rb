class BehaviorImporter < Struct.new :school_scope, :client, :log, :progress_bar

  def remote_file_name
    'behavior_export.txt'
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(school_scope)
  end

  def import_row(row)
    BehaviorRow.build(row).save!
  end
end
