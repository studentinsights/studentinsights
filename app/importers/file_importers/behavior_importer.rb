class BehaviorImporter < Struct.new :school_scope, :client

  def remote_file_name
    # Expects a CSV with the following headers, transformed to symbols by CsvTransformer during import:
    #
    # [ "state_id", "local_id", "incident_code", "event_date", "incident_time",
    #   "incident_location", "incident_description", "school_local_id" ]

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
