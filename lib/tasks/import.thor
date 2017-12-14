require 'thor'
require_relative '../../app/importers/constants/x2_importers'
require_relative '../../app/importers/constants/star_importers'
require_relative '../../app/importers/constants/file_importer_options'

class Import
  class Start < Thor::Group
    desc "Import data into your Student Insights instance"

    class_option :district,
      type: :string,
      desc: "School district you're importing for"
    class_option :school,
      type: :array,
      aliases: "-s",
      desc: "Scope by school local IDs"
    class_option :source,
      type: :array,
      default: FileImporterOptions.keys,  # This runs all X2 and STAR importers
      desc: "Import data from the specified source: #{FileImporterOptions.keys}"
    class_option :test_mode,
      type: :boolean,
      default: false,
      desc: "Redirect log output away from STDOUT; do not load Rails during import"
    class_option :progress_bar,
      type: :boolean,
      default: false,
      desc: "Show a progress bar for CSV reading (useful in development)"

    def load_rails
      unless options["test_mode"]
        require File.expand_path("../../../config/environment.rb", __FILE__)
      end
    end

    def connect_transform_import
      task = ImportTask.new(
        district: options["district"],
        school: options["school"],
        source: options["source"],
        test_mode: options["test_mode"],
        progress_bar: options["progress_bar"],
      )

      task.connect_transform_import
    end
  end
end
