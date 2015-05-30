class StarReadingImporter
  include StarImporter

  def export_file_name
    'SR'
  end

  def header_dictionary
    {
      'StateStudentID' => :state_id,
      'DateTaken' => :date_taken,
      'PR' => :reading_percentile_rank,
      'IRL' => :instructional_reading_level
    }
  end
end
