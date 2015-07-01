class StarReadingImporter
  include StarImporter

  def export_file_name
    'SR.csv'
  end

  def header_dictionary
    {
      'StudentStateID' => :state_id,
      'StudentLocalID' => :local_id,
      'AssessmentDate' => :date_taken,
      'PercentileRank' => :reading_percentile_rank,
      'SchoolLocalID' => :school_local_id,
      'IRL' => :instructional_reading_level
    }
  end
end
