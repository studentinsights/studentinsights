class Import < Thor
  desc "start", "Import data into your Student Insights instance"

  method_option :school,
    type: :array,
    aliases: "-s",
    desc: "Scope by school local IDs; use ELEM to import all elementary schools"
  method_option :first_time,
    type: :boolean,
    desc: "Fill up an empty database"

  method_option :all,
    type: :boolean,
    desc: "Import data from all sources"
  method_option :x2,
    type: :boolean,
    desc: "Import data from X2 only"
  method_option :star,
    type: :boolean,
    desc: "Import data from STAR only"

  def start
    require './config/environment'

    # Kick up a new report helper object
    report = ImportTaskReport.new([
      Student, StudentAssessment, DisciplineIncident, Absence, Tardy, Educator, School
    ])

    report.print_initial_report

    # Create Somerville schools from seed file if they are missing
    School.seed_somerville_schools if School.count == 0

    # Make sure school exists in database if school scope is set and refers
    # to a particular school. No need to check if scope is all elementary schools.
    if options["school"].present? && options["school"] != ["ELEM"]
      options["school"].map do |school_local_id|
        School.find_by_local_id!(school_local_id)
      end
    end

    # X2 importers to come first because they are the sole source of truth about students.
    # STAR importers don't import students, they only import STAR results.

    x2_importer = SomervilleX2Importers.new(options).importer
    star_importer = SomervilleStarImporters.new(options).importer

    importers = if options["all"]
      [ x2_importer, star_importer]
    elsif options["x2"]
      [ x2_importer ]
    elsif options["star"]
      [ star_importer ]
    end

    importers.flatten.each do |i|
      begin
        i.connect_transform_import
      rescue Exception => message
        puts message
      end
    end

    Student.update_risk_levels
    Student.update_student_school_years
    Student.update_recent_student_assessments
    Homeroom.destroy_empty_homerooms

    report.print_final_report
  end
end
