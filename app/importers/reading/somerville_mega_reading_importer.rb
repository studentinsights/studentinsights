class SomervilleMegaReadingImporter
  def initialize(options:)
    @log = options.fetch(:log)
    @school_local_ids = options.fetch(:school_scope, [])
    @file_text = options.fetch(:file_text, nil)

    # TODO add dependencies as instance variables
    # @student_ids_map = ::StudentIdsMap.new
    # @matcher = options.fetch(:matcher, ImportMatcher.new)
    @syncer = ::RecordSyncer.new(log: @log)
    reset_counters!
  end

  def import
    streaming_csvs = read_or_fetch_sheet
    if streaming_csv.nil?
      log('Aborting since no CSV found...')
      return
    end

    # TODO do any initialization before the core loop
    # log('Building student_ids_map...')
    # @student_ids_map.reset!
    # log("@student_ids_map built with #{@student_ids_map.size} local_id keys")

    log('Starting loop...')
    reset_counters!
    processor = MegaReadingProcessor.new(header_rows_count: 2)
    streaming_csvs.each_with_index do |csv, index|
      processor.procces(csv)
      log("processed #{index} sheets.")
    end
    log('Done loop.')
    # TODO log counts on stats
    # log("@skipped_from_school_filter: #{@skipped_from_school_filter}")
    # log("@skipped_from_student_local_id_filter: #{@skipped_from_student_local_id_filter}")
    # log("@skipped_from_empty_sep_fieldd_006: #{@skipped_from_empty_sep_fieldd_006}")

    log('Calling #delete_unmarked_records...')
    @syncer.delete_unmarked_records!(records_within_scope)
    log("Sync stats: #{@syncer.stats}")
    nil
  end

  private
  def reset_counters!
    raise 'unfinished'
    # TODO set instance variables to 0
  end

  def read_or_fetch_sheet
    raise 'unfinished'
    fetcher = GoogleSheetsFetcher.new
    fetcher.get_spreadsheet(SHEET_URL)
    # TODO add sheet url to ENV
  end

  def import_row(row, index)
    raise 'unfinished'
    # TODO the main loop!  has to respect options passed to the
    # importer (eg, school_ids_ids filter)
  end

  def records_within_scope
    raise 'unfinished'
    # The caller has to describe what records are in scope of the import (eg,
    # particular schools, date ranges, etc.) and this returns the count of deleted records.
  end
end
