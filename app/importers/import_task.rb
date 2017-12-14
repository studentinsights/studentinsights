class ImportTask

  PRIORITY = {
    EducatorsImporter => 0,
    CoursesSectionsImporter => 1,
    EducatorSectionAssignmentsImporter => 2,
    StudentsImporter => 3,
    StudentSectionAssignmentsImporter => 4,
    BehaviorImporter => 5,
    AttendanceImporter => 5,
    StudentSectionGradesImporter => 5,
    X2AssessmentImporter => 6,
    StarMathImporter::RecentImporter => 6,
    StarReadingImporter::RecentImporter => 6,
  }

  def initialize(district:,
                 school:,
                 source:,
                 test_mode:,
                 progress_bar:)
    @district = district
    @school = school
    @source = source
    @test_mode = test_mode
    @progress_bar = progress_bar
  end

  def connect_transform_import
    validate_district_option
    seed_schools_if_needed
    validate_school_options
    set_up_record
    set_up_report
    import_all_the_data
    run_update_tasks
    print_final_report
  end

  private

  ## VALIDATE DEVELOPER INPUT ##

  def validate_district_option
    if !(@district == "somerville" || @district == "new-bedford")
      raise "Unknown district!"
    end
  end

  def seed_schools_if_needed
    if School.count == 0
      case options["district"]
      when "somerville"
        School.seed_somerville_schools
      when "new-bedford"
        School.seed_new_bedford_schools
      end
    end
  end

  def validate_school_options
    school_ids.each { |id| School.find_by!(local_id: id) }
  end

  def school_ids
    return @school if @school.present?

    case @district
    when 'somerville'
      [
        'HEA', 'WSNS', 'ESCS', 'BRN', 'KDY', 'AFAS', 'WHCS', 'FC', 'CAP', 'PIC',
        'SPED', 'SHS',
      ]
    when 'new-bedford'
      [
        "010",
        "015",
        "020",
        "045",
        "040",
        "050",
        "063",
        "070",
        "075",
        "078",
        "095",
        "105",
        "115",
        "105",
        "124",
        "125",
        "130",
        "135",
        "140",
        "405",
        "410",
        "415",
        "505",
        "510",
        "515",
      ]
    else
      raise 'Unfamiliar district!'
    end
  end

  ## SET UP COMMAND LINE REPORT AND DATABASE RECORD ##

  def log
    @test_mode ? LogHelper::Redirect.instance.file : STDOUT
  end

  def set_up_record
    @record ||= ImportRecord.create(time_started: DateTime.current)
  end

  def set_up_report
    models = [ Student, StudentAssessment, DisciplineIncident, Absence, Tardy, Educator, School, Course, Section, StudentSectionAssignment, EducatorSectionAssignment ]

    log = @test_mode ? LogHelper::Redirect.instance.file : STDOUT

    @report = ImportTaskReport.new(
      models_for_report: models,
      record: @record,
      log: log,
    )

    @report.print_initial_report
  end

  ## IMPORT ALL THE DATA ##

  def sorted_file_import_classes(import_classes = file_import_classes)
    import_classes.sort_by do |import_class|
      [PRIORITY.fetch(import_class, 100), import_class.to_s]
    end
  end

  def file_import_class_to_client(import_class)
    return SftpClient.for_x2 if import_class.in?(X2Importers.list)

    return SftpClient.for_star if import_class.in?(StarImporters.list)

    return nil
  end

  def file_import_classes
    @source.map { |s| FileImporterOptions.options.fetch(s, nil) }
           .flatten
           .compact
           .uniq
  end

  def import_all_the_data
    timing_log = []

    sorted_import_classes = sorted_file_import_classes(file_import_classes)

    sorted_import_classes.each do |file_import_class|
      file_importer = file_import_class.new(
        school_ids,
        file_import_class_to_client(file_import_class),
        log,
        @progress_bar
      )

      timing_data = { importer: file_importer.class.name, start_time: Time.current }

      begin
        file_importer.import
      rescue => error
        puts "🚨  🚨  🚨  🚨  🚨  Error! #{error}" unless Rails.env.test?

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

  ## PRINT FINAL REPORT ##

  def print_final_report
    @report.print_final_report
  end

end
