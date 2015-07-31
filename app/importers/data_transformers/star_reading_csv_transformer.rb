class StarReadingCsvTransformer
  include StarCsvTransformer

  def header_dictionary
    {
      'StudentStateID' => :state_id,
      'StudentLocalID' => :local_id,
      'AssessmentDate' => :date_taken,
      'PercentileRank' => :percentile_rank,
      'SchoolLocalID' => :school_local_id,
      'IRL' => :instructional_reading_level
    }
  end
end
