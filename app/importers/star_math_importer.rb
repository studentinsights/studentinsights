class StarMathImporter
  include StarImporter

  def export_file_name
    'SM'
  end

  def header_dictionary
    {
      'StateStudentID' => :state_id,
      'DateTaken' => :date_taken,
      'PR' => :math_percentile_rank
    }
  end
end
