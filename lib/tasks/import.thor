require 'thor'
require File.expand_path("../../../config/environment.rb", __FILE__)

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
    class_option :only_recent_attendance,
      type: :boolean,
      default: false,
      desc: "Only import attendance rows from the past 90 days for faster attendance import"
    class_option :skip_old_records,
      type: :boolean,
      default: false,
      desc: "Skip old data (eg, more than a calendar year old)"
    class_option :skip_index_updates,
      type: :boolean,
      default: false,
      desc: "Skip updating indexes after the import task is completed (not recommended except for when profiling)"
    class_option :background,
      type: :boolean,
      default: false,
      desc: "Import data in a background job"

    def import
      if options.fetch(:background)
        Delayed::Job.enqueue ImportJob.new(options: options)
      else
        ImportTask.new(options: options).connect_transform_import
      end
    end
  end
end
