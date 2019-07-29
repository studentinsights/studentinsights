# Import services from different format transition sheets.
# The transition sheets are split by instructional and social-emotional,
# since that's how entry happened for educators, but this reads
# them both and assumes they all only have partial data.
class BedfordDavisServicesImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_GOOGLE_DRIVE_SHEET,
      frequency: DataFlow::FREQUENCY_ONE_TIME_BATCH,
      options: [],
      merge: DataFlow::MERGE_CREATE_NAIVELY,
      touches: [
        Service.name
      ],
      description: 'Services from social emotional and transition note sheets at Davis'
    })
  end

  def initialize(options:)
    @folder_ids = options.fetch(:folder_ids, read_folder_ids_from_env())

    @log = options.fetch(:log, STDOUT)
    @time_now = options.fetch(:time_now, Time.now)
    @fetcher = options.fetch(:fetcher, GoogleSheetsFetcher.new)
    @matcher = options.fetch(:matcher, ImportMatcher.new)
    @syncer = options.fetch(:syncer, SimpleSyncer.new(log: @log))
  end

  def import
    raise 'This should be done manually, because of DataFlow::MERGE_CREATE_NAIVELY strategy.  Use #dry_run instead.'
  end

  def dry_run
    rows = fetch_tabs().flat_map do |tab|
      process_tab(tab)
    end
    rows
  end

  def stats
    {
      matcher: @matcher.stats,
      syncer: @syncer.stats
    }
  end

  private
  def read_folder_ids_from_env
    PerDistrict.new.imported_google_folder_ids('bedford_davis_services_importer_folder_ids')
  end

  def fetch_tabs
    @folder_ids.flat_map do |folder_id|
      @fetcher.get_tabs_from_folder(folder_id)
    end
  end

  def process_tab(tab)
    # skip info tab
    return [] if tab.tab_name == 'INFO'

    # find educator and homeroom by tab.tab_name
    educator = match_educator(tab.tab_name)
    return [] if educator.nil?

    # process
    processor = BedfordDavisServicesProcessor.new(educator, {
      log: @log,
      time_now: @time_now
    })
    processor.dry_run(tab.tab_csv)
  end

  def match_educator(tab_name)
    educator_from_login_name = @matcher.find_educator_by_login(tab_name, disable_metrics: true)
    if educator_from_login_name.present?
      @matcher.count_valid_row
      return educator_from_login_name
    end

    educator_from_last_name = @matcher.find_educator_by_last_name(tab_name)
    if educator_from_last_name.present?
      @matcher.count_valid_row
      return educator_from_last_name
    end

    nil
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "BedfordDavisServicesImporter: #{text}"
  end
end
