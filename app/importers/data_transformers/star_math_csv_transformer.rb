class StarMathCsvTransformer
  include StarCsvTransformer

  def header_dictionary
    {
      'StudentStateID' => :state_id,
      'StudentLocalID' => :local_id,
      'AssessmentDate' => :date_taken,
      'SchoolLocalID' => :school_local_id,
      'PercentileRank' => :percentile_rank,
      'GradeEquivalent' => :grade_equivalent
    }
  end
end
