class Import < Thor
  desc "start", "Import data into your Student Insights instance"
  method_option :school,
    aliases: "-s",
    desc: "Scope by school"
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

    if options["school"].present?
      school_scope = School.find_by_local_id(options["school"])
      raise "School not found" if school_scope.blank?
    end

    settings = Settings.new({
      district_scope: options["district"],
      school_scope: school_scope
    }).configure

    ImportInitializer.import(settings)
  end
end
