# DEPRECATED, DEPRECATED, see RestrictedNotesProcessor and migrate to `restricted_notes`
#
# Process sheets about social emotional services and sensitive notes from counselors,
# mapping to restricted notes.
class BedfordDavisSocialEmotionalImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_GOOGLE_DRIVE_SHEET,
      frequency: DataFlow::FREQUENCY_ONE_TIME_BATCH,
      options: [],
      merge: DataFlow::MERGE_CREATE_NAIVELY,
      touches: [
        EventNote.name
      ],
      description: 'Process checklists and notes from social emotional and transition note sheets at Davis and create restricted notes'
    })
  end

  def initialize(options:)
    Rollbar.warn('deprecation-warning, DEPRECATED, see RestrictedNotesProcessor and migrate to `restricted_notes`')
    @folder_id = options.fetch(:folder_id, read_folder_id_from_env())

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
    fetch_tabs().flat_map do |tab|
      process_tab(tab)
    end
  end

  def stats
    {
      matcher: @matcher.stats,
      syncer: @syncer.stats
    }
  end

  private
  def read_folder_id_from_env
    PerDistrict.new.imported_google_folder_ids('bedford_davis_social_emotional_folder_id')
  end

  def fetch_tabs
    @folder_ids.flat_map do |folder_id|
      @fetcher.get_tabs_from_folder(folder_id)
    end
  end

  def process_tab(tab)
    # skip info tab
    return [] if tab.tab_name == 'INFO'

    # find educator by tab.tab_name
    educator = @matcher.find_educator_by_name_flexible(tab.tab_name)
    return [] if educator.nil?
    @matcher.count_valid_row

    # process
    processor = BedfordDavisSocialEmotionalProcessor.new(educator, {
      log: @log,
      time_now: @time_now
    })
    processor.dry_run(tab.tab_csv)
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "BedfordDavisSocialEmotionalImporter: #{text}"
  end
end
