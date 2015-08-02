class ImportInitializer

  def self.import(from)
    from.each do |i|
      begin
        if Rails.env.development?
          i.connect_transform_import_locally
        else
          i.connect_transform_import
        end
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
