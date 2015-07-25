module Importer

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
      puts "#{McasResult.count} MCAS results"
      puts "#{StarResult.count} STAR results"
      puts "#{DisciplineIncident.count} discipline incidents"
      puts "#{AttendanceEvent.count} attendance events"
    end
  end

  def initialize(options = {})
    @school = options[:school]
    @recent_only = options[:recent_only]
    @summer_school_local_ids = options[:summer_school_local_ids]    # For importing only summer school students
  end

  # SCOPED IMPORT #

  def handle_row(row)
    if @school.present?
      import_if_in_school_scope(row)
    elsif @summer_school_local_ids.present?
      import_if_in_summer_school(row)
    else
      import_row row
    end
  end

  def import_if_in_school_scope(row)
    if @school.local_id == row[:school_local_id]
      import_row row
    end
  end

  def import_if_in_summer_school(row)
    if @summer_school_local_ids.include? row[:local_id]
      import_row row
    end
  end
end
