class StarImporters

  def self.list
    [
      StarReadingImporter::RecentImporter,
      StarMathImporter::RecentImporter,
    ]
  end

end
