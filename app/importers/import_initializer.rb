class ImportInitializer

  def self.import_classes
    [
      StudentsImporter,
      X2AssessmentImporter,
      StarMathImporter,
      StarReadingImporter,
      BehaviorImporter,
      AttendanceImporter
    ]
  end

  def self.import_all(options = {})
    import_classes.each do |i|
      begin
        i.new(options).connect_and_import
      rescue Exception => message
        puts message
      end
    end
    if Rails.env.development?
      puts "#{Student.count} students"
      puts "#{Assessment.count} assessments"
      puts "#{DisciplineIncident.count} discipline incidents"
      puts "#{AttendanceEvent.count} attendance events"
    end
  end
end
