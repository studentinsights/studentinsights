require 'thor'
require_relative '../../app/importers/constants/x2_importers'
require_relative '../../app/importers/constants/star_importers'
require_relative '../../app/importers/constants/file_importer_options'

class Import
  class Start < Thor::Group
    desc "Import data into your Student Insights instance"

    class_option :school,
      type: :array,
      desc: "Scope by school"
    class_option :source,
      type: :array,
      default: ['x2', 'star'],  # This runs all X2 and STAR importers
      desc: "Import data from one of #{FileImporterOptions.keys}"
    class_option :test_mode,
      type: :boolean,
      default: false,
      desc: "Redirect log output away from STDOUT; do not load Rails during import"
    class_option :progress_bar,
      type: :boolean,
      default: false,
      desc: "Show progress bar"
    class_option :only_recent_attendance,
      type: :boolean,
      default: false,
      desc: "Only import attendance rows from the past 90 days for faster attendance import"

    def load_rails
      unless options["test_mode"]
        require File.expand_path("../../../config/environment.rb", __FILE__)
      end
    end

    def connect_transform_import
      ImportTask.new(options: options).connect_transform_import
    end
  end
end
