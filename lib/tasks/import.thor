require 'thor'
require File.expand_path("../../../config/environment.rb", __FILE__)

class Import
  class Start < Thor::Group
    desc "Import data into your Student Insights instance"

    class_option :school_local_ids,
      type: :array,
      default: all_school_local_ids,
      desc: "Scope by school local_id (not Insights school.id)"
    class_option :importer_keys,
      type: :array,
      default: all_importer_keys,
      desc: "Import data from one of #{all_importer_keys.join(', ')}"
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

    private
    def all_school_local_ids
      LoadDistrictConfig.new.schools.map { |school| school["local_id"] }
    end

    def all_importer_keys
      FileImporterOptions.importer_descriptions.map(&:key)
    end
  end
end
