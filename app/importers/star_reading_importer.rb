require 'csv'

class StarReadingImporter < Struct.new(:star_data_path)
  include StarImporter
  
  def header_dictionary
    {
      'PR' => 'reading_percentile_rank',
      'IRL' => 'instructional_reading_level'
    }
  end
end
