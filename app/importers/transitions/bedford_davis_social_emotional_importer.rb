# DEPRECATED, see RestrictedNotesProcessor and migrate to `restricted_notes`
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
    @acknowledge_deprecation = options.fetch(:acknowledge_deprecation, false)
    unless @acknowledge_deprecation
      Rollbar.warn('deprecation-warning, DEPRECATED, see RestrictedNotesProcessor and migrate to `restricted_notes`')
    end
    @folder_id = options.fetch(:folder_id, read_folder_id_from_env())

    @log = options.fetch(:log, STDOUT)
    @time_now = options.fetch(:time_now, Time.now)
    @fetcher = options.fetch(:fetcher, GoogleSheetsFetcher.new)
    @matcher = options.fetch(:matcher, ImportMatcher.new)
    @syncer = options.fetch(:syncer, SimpleSyncer.new(log: @log))
    @processors_used = []
  end

  def import
    raise 'This should be done manually, because of DataFlow::MERGE_CREATE_NAIVELY strategy.  Use #dry_run instead.'
  end

  def dry_run
    rows = []
    fetch_tabs().each do |tab|
      rows += process_tab(tab)
    end
    rows
  end

  def stats
    {
      matcher: @matcher.stats,
      syncer: @syncer.stats,
      reduced_processor_stats: reduced_processor_stats(@processors_used)
    }
  end

  private
  def read_folder_id_from_env
    PerDistrict.new.imported_google_folder_ids('bedford_davis_social_emotional_folder_id')
  end

  def fetch_tabs
    @fetcher.get_tabs_from_folder(@folder_id)
  end

  def process_tab(tab)
    return [] if tab.tab_name == 'INFO'

    # find educator by tab.tab_name
    educator = @matcher.find_educator_by_name_flexible(tab.tab_name)
    return [] if educator.nil?
    @matcher.count_valid_row

    # process
    processor = BedfordDavisSocialEmotionalProcessor.new(educator, {
      log: @log,
      time_now: @time_now,
      acknowledge_deprecation: @acknowledge_deprecation
    })
    @processors_used << processor
    processor.dry_run(tab.tab_csv)
  end

  def reduced_processor_stats(processors)
    summary = {}
    processors.each do |processor|
      stats = processor.stats
      summary[:used_counselor_mapping_count] = summary.fetch(:used_counselor_mapping_count, 0) + stats[:used_counselor_mapping_count]
      summary[:invalid_counselor_mapping_count] = summary.fetch(:invalid_counselor_mapping_count, 0) + stats[:invalid_counselor_mapping_count]
      summary[:used_counselor_lookup_count] = summary.fetch(:used_counselor_lookup_count, 0) + stats[:used_counselor_lookup_count]
      summary[:default_educator_rows_count] = summary.fetch(:default_educator_rows_count, 0) + stats[:default_educator_rows_count]

      summary[:matcher_valid_rows_count] = summary.fetch(:matcher_valid_rows_count, 0) + stats[:matcher][:valid_rows_count]
      summary[:matcher_invalid_rows_count] = summary.fetch(:matcher_invalid_rows_count, 0) + stats[:matcher][:invalid_rows_count]
      summary[:matcher_invalid_student_local_ids] = summary.fetch(:matcher_invalid_student_local_ids, []) + stats[:matcher][:invalid_student_local_ids]
      summary[:matcher_invalid_educator_emails_size] = summary.fetch(:matcher_invalid_educator_emails_size, 0) +    stats[:matcher][:invalid_educator_emails_size]
      summary[:matcher_invalid_educator_last_names_size] = summary.fetch(:matcher_invalid_educator_last_names_size, 0) +    stats[:matcher][:invalid_educator_last_names_size]
      summary[:matcher_invalid_educator_logins_size] = summary.fetch(:matcher_invalid_educator_logins_size, 0) +    stats[:matcher][:invalid_educator_logins_size]
      summary[:matcher_invalid_course_numbers] = summary.fetch(:matcher_invalid_course_numbers, []) + stats[:matcher][:invalid_course_numbers]
      summary[:matcher_invalid_sep_oids] = summary.fetch(:matcher_invalid_sep_oids, []) + stats[:matcher][:invalid_sep_oids]

      summary[:processor_valid_hashes_count] = summary.fetch(:processor_valid_hashes_count, 0) + stats[:processor][:valid_hashes_count]
      summary[:processor_invalid_rows_count] = summary.fetch(:processor_invalid_rows_count, 0) + stats[:processor][:invalid_rows_count]
      summary[:processor_invalid_student_ids_count] = summary.fetch(:processor_invalid_student_ids_count, 0) + stats[:processor][:invalid_student_ids_count]
      summary[:processor_created_rows_count] = summary.fetch(:processor_created_rows_count, 0) + stats[:processor][:created_rows_count]
    end
    summary
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "BedfordDavisSocialEmotionalImporter: #{text}"
  end
end
