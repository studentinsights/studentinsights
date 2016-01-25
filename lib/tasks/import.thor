class Import < Thor
  desc "start", "Import data into your Student Insights instance"
  method_option :school,
    aliases: "-s",
    desc: "Scope by school local ID; use ELEM to import all elementary schools"
  method_option :district,
    aliases: "-d",
    desc: "Scope by school district / charter organization"
  method_option :first_time,
    type: :boolean,
    desc: "Fill up an empty database"
  method_option :recent_only,
    type: :boolean,
    desc: "For data update, only look at recent rows"

  def start
    require './config/environment'

    # Kick up a new report helper object
    report = ImportTaskReport.new([
      Student,
      StudentAssessment,
      DisciplineIncident,
      AttendanceEvent,
      Educator,
      School
    ])

    puts; puts "=== STARTING IMPORT TASK... ==="

    puts; puts "=== INITIAL DATABASE COUNTS ==="; puts

    puts report.initial_counts_report                   # Report out db counts before task runs

    initial_counts_hash = report.initial_counts_hash    # Store initial values so we can diff later

    # Create Somerville schools from seed file if they are missing

    School.seed_somerville_schools if options["district"] == "Somerville" &&
                                      School.count == 0

    # Make sure school exists in database if school scope is set and refers
    # to a particular school. No need to check if scope is all elementary schools.

    School.find_by_local_id!(options["school"]) if options["school"].present? &&
                                                   options["school"] != "ELEM"

    importer_options = {
      district_scope: options["district"],
      school_scope: options["school"],
      first_time: options["first_time"],
      recent_only: options["recent_only"]
    }

    importers = case options["district"]
      when "Somerville"
        # X2 importers to come first because they are the sole source of truth about students.
        # STAR importers don't import students, they only import STAR results.

        [ SomervilleX2Importers.new(importer_options).importer,
          SomervilleStarImporters.new(importer_options).importer ].flatten
      when "KIPP NJ"
        KippNjSettings.new(importer_options).importers
      else
        raise "don't know about that school district buddy"
      end

    importers.each do |i|
      begin
        i.connect_transform_import
      rescue Exception => message
        puts message
      end
    end

    Student.update_risk_levels
    Student.update_student_school_years
    Student.update_attendance_events_counts_most_recent_school_year
    Student.update_recent_student_assessments

    Homeroom.destroy_empty_homerooms

    puts; puts; puts "=== FINAL DATABASE COUNTS ==="; puts
    puts report.end_of_task_report(initial_counts_hash)
  end
end
