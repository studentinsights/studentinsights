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
          SomervilleStarImporters.new(importer_options).importer ]
      when "KIPP NJ"
        KippNjSettings.new(importer_options).importers
      else
        raise "don't know about that school district buddy"
      end

    importers.each do |i|
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

    Student.update_risk_levels
    Homeroom.destroy_empty_homerooms

    puts "#{Student.count} students"
    puts "#{StudentAssessment.count} assessments"
    puts "#{DisciplineIncident.count} discipline incidents"
    puts "#{AttendanceEvent.count} attendance events"
    puts "#{Educator.count} educators"
    puts "#{School.count} schools"
  end
end
