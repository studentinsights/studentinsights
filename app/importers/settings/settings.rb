class Settings

  def initialize(options = {})
    @district_scope = options[:district_scope]
    @importer_options = {
      school_scope: options[:school_scope],
      first_time: options[:first_time],
      recent_only: options[:recent_only]
    }
  end

  def configure
    case @district_scope
    when "Somerville"
      Settings::SomervilleSettings.new(@importer_options).configuration
    when "KIPP NJ"
      Settings::KippNjSettings.new(@importer_options).configuration
    else
      raise "don't know about that school district buddy"
    end
  end
end
