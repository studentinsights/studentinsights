# DEPRECATED, migrate to `services_checklist` or `bulk_services`')
#
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
    @acknowledge_deprecation = options.fetch(:acknowledge_deprecation, false)
    unless @acknowledge_deprecation
      Rollbar.warn('deprecation-warning, migrate to `services_checklist` or `bulk_services`')
    end
    @folder_ids = options.fetch(:folder_ids, read_folder_ids_from_env())

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
    fetch_tabs().flat_map do |tab|
      process_tab(tab)
    end
  end

  def stats
    {
      matcher: @matcher.stats,
      syncer: @syncer.stats,
      reduced_processor_stats: reduced_processor_stats(@processors_used)
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

    # find educator by tab.tab_name
    educator = @matcher.find_educator_by_name_flexible(tab.tab_name)
    return [] if educator.nil?
    @matcher.count_valid_row

    # process
    processor = BedfordDavisServicesProcessor.new(educator, {
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
      summary[:matcher_valid_rows_count] = summary.fetch(:matcher_valid_rows_count, 0) + stats[:matcher][:valid_rows_count]
      summary[:matcher_invalid_rows_count] = summary.fetch(:matcher_invalid_rows_count, 0) + stats[:matcher][:invalid_rows_count]
      summary[:matcher_invalid_student_local_ids] = summary.fetch(:matcher_invalid_student_local_ids, []) + stats[:matcher][:invalid_student_local_ids]
      summary[:matcher_invalid_educator_emails_size] = summary.fetch(:matcher_invalid_educator_emails_size, 0) +    stats[:matcher][:invalid_educator_emails_size]
      summary[:matcher_invalid_educator_last_names_size] = summary.fetch(:matcher_invalid_educator_last_names_size, 0) +    stats[:matcher][:invalid_educator_last_names_size]
      summary[:matcher_invalid_educator_logins_size] = summary.fetch(:matcher_invalid_educator_logins_size, 0) +    stats[:matcher][:invalid_educator_logins_size]
      summary[:matcher_invalid_course_numbers] = summary.fetch(:matcher_invalid_course_numbers, []) + stats[:matcher][:invalid_course_numbers]
      summary[:matcher_invalid_sep_oids] = summary.fetch(:matcher_invalid_sep_oids, []) + stats[:matcher][:invalid_sep_oids]
    end
    summary
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "BedfordDavisServicesImporter: #{text}"
  end
end
