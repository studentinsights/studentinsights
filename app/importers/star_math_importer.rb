class StarMathImporter
  include StarImporter

  def export_file_name
    'SM.csv'
  end

  def header_dictionary
    {
      'StudentStateID' => :state_id,
      'StudentLocalID' => :local_id,
      'AssessmentDate' => :date_taken,
      'SchoolLocalID' => :school_local_id,
      'PercentileRank' => :math_percentile_rank,
    }
  end
end
