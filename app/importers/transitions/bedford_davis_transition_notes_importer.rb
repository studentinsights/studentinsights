# DEPRECATED, migrate to `services_checklist` and `teacher_forms` templates'
#
# Import transition notes, just notes and not services (even though
# they are in the same sheets).
class BedfordDavisTransitionNotesImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_GOOGLE_DRIVE_SHEET,
      frequency: DataFlow::FREQUENCY_ONE_TIME_BATCH,
      options: [],
      merge: DataFlow::MERGE_REPLACE_ALL_WITHIN_SCOPE,
      touches: [
        ImportedForm.name
      ],
      description: 'Transition notes for elementary school students at Davis (services only as text)'
    })
  end

  def initialize(options:)
    Rollbar.warn('deprecation-warning: migrate to `services_checklist` and `teacher_forms` templates')
    @folder_id = options.fetch(:folder_id, read_folder_id_from_env())

    @log = options.fetch(:log, STDOUT)
    @fetcher = options.fetch(:fetcher, GoogleSheetsFetcher.new)
    @matcher = options.fetch(:matcher, ImportMatcher.new)
    @syncer = options.fetch(:syncer, SimpleSyncer.new(log: @log))
  end

  def import
    rows = dry_run()
    records = rows.map {|row| ImportedForm.new(row) }

    # sync
    form_key = ImportedForm::BEDFORD_DAVIS_TRANSITION_NOTES_FORM
    records_within_scope = ImportedForm.where(form_key: form_key)
    @syncer.sync_and_delete_unmarked!(records, records_within_scope)
    log "stats.to_json: #{stats.to_json}"
    nil
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
  def read_folder_id_from_env
    PerDistrict.new.imported_google_folder_ids('bedford_davis_transition_notes_importer_folder_id')
  end

  def fetch_tabs
    @fetcher.get_tabs_from_folder(@folder_id)
  end

  def process_tab(tab)
    # skip info tab
    return [] if tab.tab_name == 'INFO'

    # url to specific tab
    form_url = "#{tab.spreadsheet_url}#gid=#{tab.tab_id}"

    # find educator and homeroom by tab.tab_name
    educator = @matcher.find_educator_by_name_flexible(tab.tab_name)
    return [] if educator.nil?

    # process and create
    processor = BedfordDavisTransitionNotesProcessor.new(educator, form_url, log: @log)
    processor.dry_run(tab.tab_csv)
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "BedfordDavisTransitionNotesImporter: #{text}"
  end
end
