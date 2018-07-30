class ImportTask
  def initialize(options:)
    @options = options

    # options["school"] is an optional filter; imports all schools if nil
    @school = @options.fetch("school", :all)

    # options["source"] describes which external data sources to import from
    @source = @options.fetch("source", ["x2", "star"])

    # This option controls whether older data is ignored.  Different importers
    # respond differently to these options (some do not respect them).
    @skip_old_records = @options.fetch('skip_old_records', false)

    # to skip updating any indexes after (eg, when tuning a particular job)
    @skip_index_updates = @options.fetch('skip_index_updates', false)

    @log = Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT
  end

  def connect_transform_import
    begin
      @record = create_import_record
      @report = create_report
      log('Starting validation...')
      validate_district_option
      seed_schools_if_needed
      validate_school_options
      log('Done validation.')

      log('Starting importing work...')
      @report.print_initial_counts_report
      import_all_the_data
      log('Done importing work.')

      log('Starting update tasks and final report...')
      run_update_tasks
      @report.print_final_counts_report
      log('Done.')
    rescue SignalException => err
      # Delayed::Job can trap and raise this (eg, if Heroku is about to restart the
      # dyno).  This is an expected occurrence, and the worker should stop, and after it comes back
      # up the new worker should retry the job and succeed.  So we don't need to alert on each occurrence.
      log("ImportTask caught a SignalException: #{err}")
      log('Re-raising the SignalException...')
      raise err
    rescue => err
      # Note that there is also separate error handling for each importer class independently.
      log("ImportTask aborted because of an error: #{err}")
      log("Re-raising exception...")
      Rollbar.error('ImportTask aborted because of an error', err)
      raise err
    end
  end

  private

  ## VALIDATE DEVELOPER INPUT ##

  def validate_district_option
    # The LoadDistrictConfig class uses `fetch`, which will validate the
    # district option for us
    LoadDistrictConfig.new.load_yml
  end

  def seed_schools_if_needed
    School.seed_schools_for_district if School.count == 0
  end

  def validate_school_options
    # If the developer is passing in a list of school IDs to filter by,
    # we check that the IDs are valid and the schools exist in the database.

    return if @school == :all

    @school.each { |id| School.find_by!(local_id: id) }
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

  def options_for_file_importers
    {
      school_scope: @school,
      log: @log,
      skip_old_records: @skip_old_records
    }
  end

  # This is the main method doing all the work
  def import_all_the_data
    log('Starting #import_all_the_data...')
    file_import_classes = UnwrapFileImporterOptions.new(@source).sort_file_import_classes
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
        log("Error! #{error}")
        log(error.backtrace)

        message = "ImportTask#import_all_the_data caught an error from #{file_import_class.name} and aborted that import task, but is continuing the job..."
        log(message)
        extra_info =  { "importer" => file_importer.class.name }
        Rollbar.error(message, error, extra_info)
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
    if @skip_index_updates
      log('Skipping index updates...')
      return
    end

    begin
      log('Calling Student.update_recent_student_assessments...')
      Student.update_recent_student_assessments

      log('Homeroom.destroy_empty_homerooms...')
      Homeroom.destroy_empty_homerooms
    rescue => error
      Rollbar.error('ImportTask#run_update_tasks', error)
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
