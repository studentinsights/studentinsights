# Define the import jobs that we run from the Heroku scheduler.
class BatchJobs
  def initialize(options = {})
    @options = default_options(options){
      log: STDOUT,
      progress_bar: true,
      school_scope: School.all.map(&:local_id)
    }.merge(options)
  end

  def import_core
    import from_x2 [
      EducatorsImporter,
      StudentsImporter,
      CoursesSectionsImporter,
      EducatorSectionAssignmentsImporter
    ]
    safely do
      Student.update_risk_levels
      Student.update_recent_student_assessments
      Homeroom.destroy_empty_homerooms
    end
  end

  def import_attendance
    import from_x2 [
      BehaviorImporter,
      AttendanceImporter
    ]
  end

  def import_assessment
    import from_x2 [
      X2AssessmentImporter,
      StudentSectionAssignmentsImporter,
      StudentSectionGradesImporter
    ]
  end

  def import_star
    import from_star [
      StarReadingImporter::RecentImporter,
      StarMathImporter::RecentImporter
    ]
  end

  private
  def safely
    begin
      yield block
    rescue => error # TODO(kr) is this how we want to catch?
      ErrorMailer.error_report(error).deliver_now if Rails.env.production?
      log.write(error)
    end
  end

  # Run all the importers as a batch, 
  def import(importers)
    safely do
      results = BatchJobRunner.new(log: @options[:log]).invoke_for(importers)
      # TODO(kr) check for failures, timing, etc.
      # TODO(kr) email analysis?
    end
  end

  def from_x2(importer_classes)
    importer_classes.map do |klass|
      klass.new(@options[:school_scope], SftpClient.for_x2, @options[:log], @options[:progress_bar]
    end
  end

  def from_star(importer_classes)
    importer_classes.map do |klass|
      klass.new(@options[:school_scope], SftpClient.for_star, @options[:log], @options[:progress_bar]
    end
  end
end


# Given a set of importer instances, perform the import while
# logging, instrumenting timing, and reporting.
# TODO(kr) should return list with data about what each importer did,
# catching any exceptions as data, aborting the current importer, but
# moving on to the next importer.
# TODO(kr) for batch: track timing, store status, report on what changed
# TODO(kr) return analysis?
class BatchJobRunner
  def initialize(options = {})
    @options = options
  end

  def invoke_for(importers)
    @importers = importers # SomervilleX2Importers
    load_rails
    set_up_initial_record
    print_initial_report
    # validate_schools
    # connect_transform_import
    
    print_final_report
    record_end_time
  end

  def set_up_initial_record
    @record ||= ImportRecord.create(time_started: DateTime.current)
  end

  def print_initial_report
    report.print_initial_report
  end

  # TODO(kr) for batch: track timing, store status, report on what changed
  def connect_transform_import
    timing_log = []
    @importers.map do |importer|
      begin
        timing_data = { importer: importers.to_s, start_time: Time.current }
        FileImport.new(importers).import
        timing_data[:end_time] = Time.current
        timing_log << timing_data
      end
    end
    timing_log
  end

  def print_final_report
    report.print_final_report
  end

  def record_end_time
    @record.time_ended = DateTime.current
    @record.save!
  end

  private
  def report
    models = [ Student, StudentAssessment, DisciplineIncident, Absence, Tardy, Educator, School, Course, Section, StudentSectionAssignment, EducatorSectionAssignment ]
    @report ||= ImportTaskReport.new(models, @options[:log])
  end
end


end