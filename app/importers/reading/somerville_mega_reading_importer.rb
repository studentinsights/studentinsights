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
    streaming_csv = read_or_fetch_csv
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
    streaming_csv.each_with_index do |row, index|
      import_row(row)
      log("processed #{index} rows.") if index % 1000 == 0
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

  def read_or_fetch_csv
    raise 'unfinished'
    # TODO read from google or mock and return `streaming_csv` that responds
    # to #each_with_index
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
