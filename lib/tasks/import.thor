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
    class_option :background,
      type: :boolean,
      default: true,
      desc: "Import data in a background job"

    def import
      job_options = options.merge({ attempt: 0 })

      if options.fetch(:background)
        Delayed::Job.enqueue ImportJob.new(options: job_options)
      else
        ImportTask.new(options: job_options).connect_transform_import
      end
    end
  end
end
