class ImportTask
  # If passed invalid arguments, validete and fail in the constructor
  def initialize(options:)
    @options = options.symbolize_keys

    # which schools to include
    @school_local_ids = validate_school_local_ids!(@options[:school_local_ids])

    # which importers to run
    @importer_descriptions = validate_importer_keys!(@options[:importer_keys])

    # only recent attendance data, or all of it
    raise 'missing options[:only_recent_attendance]' unless @options.has_key?(:only_recent_attendance)
    @only_recent_attendance = @options[:only_recent_attendance]

    # log differently
    @log = Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT
  end

  def connect_transform_import
    begin
      log('Setting up logging...')
      @record = create_import_record
      log('Done logging.')

      log('Running inital report...')
      @report = create_report
      @report.print_initial_counts_report
      log('Done initial report.')

      log('Starting importing work...')
      import_all_the_data
      log('Done importing work.')

      log('Starting update tasks...')
      run_update_tasks
      log('Done update tasks.')

      log('Running final report...')
      @report.print_final_counts_report
      log('Done final report.')
      log('Done with everything.')
    rescue SignalException => e
      log("Encountered a SignalException!: #{e}")

      if (@options.attempt == 0)
        log('Putting a new job into the queue...')
        Delayed::Job.enqueue ImportJob.new(
          options: @options.merge({ attempt: @options.attempt + 1 })
        )
      else
        log('Already re-tried this once, not going to retry again...')
      end

      log('Bye!')
    end
  end

  private

  ## VALIDATE DEVELOPER INPUT ##
  def validate_school_local_ids!(school_local_ids)
    raise 'missing school_local_ids' if school_local_ids.nil? || school_local_ids.size == 0

    # If the developer is passing in a list of school IDs to filter by,
    # we check that the IDs are valid and the schools exist in the database.
    school_local_ids.each {|local_id| School.find_by!(local_id: local_id) }
    school_local_ids
  end

  # Validate and return ImporterDescriptions
  def validate_importer_keys!(importer_keys)
    raise 'missing importer_keys' if importer_keys.nil? || importer_keys.size == 0

    unexpected_importer_keys = (importer_keys - FileImporterOptions.importer_descriptions.map(&:key)).size
    raise "unexpected_importer_keys: #{unexpected_importer_keys.join(', ')}" if unexpected_importer_keys.size > 0

    FileImporterOptions.importer_descriptions.select do |importer_description|
      importer_keys.include?(importer_description.key)
    end
  end

  ## SET UP COMMAND LINE REPORT AND DATABASE RECORD ##
  def create_import_record
    ImportRecord.create(
      task_options_json: @options.to_json,
      time_started: DateTime.current,
    )
  end

  def create_report
    models = [
      Student,
      StudentAssessment,
      DisciplineIncident,
      Absence,
      Tardy,
      Educator,
      School,
      Course,
      Section,
      StudentSectionAssignment,
      EducatorSectionAssignment
    ]
    ImportTaskReport.new(
      models_for_report: models,
      record: @record,
      log: @log,
    )
  end

  ## IMPORT ALL THE DATA ##

  # This defines the shared interface between all importer classes.
  def options_for_file_importers
    {
      school_scope: @school_local_ids,
      log: @log,
      only_recent_attendance: @only_recent_attendance
    }
  end

  # This is the main method doing all the work
  def import_all_the_data
    log('Starting #import_all_the_data...')
    file_import_classes = FileImporterOptions.ordered_by_priority(@importer_descriptions).map(&:importer_class)
    log("file_import_classes = [\n  #{file_import_classes.join("\n  ")}\n]")
    timing_log = []

    file_import_classes.each do |file_import_class|
      file_importer = file_import_class.new(options: options_for_file_importers)

      timing_data = { importer: file_importer.class.name, start_time: Time.current }

      begin
        log("Starting file_importer#import for #{file_importer.class}...")
        file_importer.import
        log("Done file_importer#import for #{file_importer.class}.")
      rescue => error
        log("🚨  🚨  🚨  🚨  🚨  Error! #{error}")
        log(error.backtrace)

        extra_info =  { "importer" => file_importer.class.name }
        ErrorMailer.error_report(error, extra_info).deliver_now if Rails.env.production?
      end

      timing_data[:end_time] = Time.current
      timing_log << timing_data

      @record.update(
        importer_timing_json: timing_log.to_json,
        time_ended: DateTime.current,
      )

      @record.save!
    end
    log('Done #import_all_the_data...')
  end

  ## RUN TASKS THAT CACHE DATA ##

  def run_update_tasks
    begin
      Student.update_risk_levels!
      Student.update_recent_student_assessments
      Homeroom.destroy_empty_homerooms
    rescue => error
      ErrorMailer.error_report(error).deliver_now if Rails.env.production?
      raise error
    end
  end

  ## LOGGING STUFF ##

  def log(msg)
    full_msg = "\n\n💾  ImportTask: #{msg}"
    @log.puts full_msg
    @log.flush # prevent buffering, this seems to be a problem in production jobs
    @record.log += full_msg
    @record.save
  end
end
