require 'optparse'

# Parse command line options.  Does not validate them.
class ImportOptionsParser
  def initialize(argv)
    @argv = argv
  end

  def parsed_options
    # defaults go here
    options = {
      background: true,
      only_recent_attendance: false,
      importer_keys: all_importer_keys,
      school_local_ids: all_school_local_ids
    }

    # add new options here
    parser = OptionParser.new do |opts|
      opts.banner = "Usage: bundle exec rake import:run -- [options]"

      opts.on("--background", "Add job into DelayedJob queue.") do |value|
        options[:background] = value
      end

      opts.on("--only-recent-attendance", "Only import attendance rows from the past 90 days for faster attendance import.") do |value|
        options[:only_recent_attendance] = value
      end

      opts.on("--school-local-ids x,y,z", Array, "Scope import to only these school local_ids (not Insights school.id).") do |school_local_ids|
        options[:school_local_ids] = school_local_ids
      end

      opts.on("--importer-keys x,y,z", Array, "Import data from one of #{all_importer_keys.join(', ')}.") do |importer_keys|
        options[:importer_keys] = importer_keys
      end
    end

    arguments = argv_without_rake
    parser.parse!(arguments)
    options
  end

  private
  def argv_without_rake
    raise "Expected to be called from a rake task" if @argv.size < 1
    if @argv.size > 1
      raise 'When calling from a rake task, use -- after the script name to pass arguments' unless @argv[1] == '--'
      @argv.drop(2) # cut out rake task name and --
    else
      []
    end
  end

  def all_school_local_ids
    LoadDistrictConfig.new.schools.map { |school| school["local_id"] }
  end

  def all_importer_keys
    FileImporterOptions.importer_descriptions.map(&:key)
  end
end
