require 'csv'

class StarMathImporter < Struct.new(:star_data_path)
  include StarImporter
  
  def header_dictionary
    { 'PR' => 'math_percentile_rank' }
  end
end
