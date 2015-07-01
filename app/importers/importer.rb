class Importer

  def self.import_classes
    [
      StudentsImporter,
      McasImporter,
      StarMathImporter,
      StarReadingImporter,
      BehaviorImporter,
      AttendanceImporter
    ]
  end

  def self.import_all(school_arg = {})
    import_classes.each do |i|
      begin
        i.new(school_arg).connect_and_import
      rescue Exception => message
        puts message
      end
    end
  end
end
