class FormToNotesImporter

  def initialize(options:)
    @sheet_id = options.fetch(:sheet_id, nil)
    raise 'missing @sheet_id' if @sheet_id.nil?

    @log = options.fetch(:log, STDOUT)
    @time_now = options.fetch(:time_now, Time.now)
    @fetcher = options.fetch(:fetcher, GoogleSheetsFetcher.new)
    @matcher = options.fetch(:matcher, ImportMatcher.new)
    @syncer = options.fetch(:syncer, SimpleSyncer.new(log: @log))
    reset_counters!
  end

  # def import
  #   rows = dry_run()
  #   records = rows.map {|row| ImportedForm.new(row) }
  #   sync!(records)
  #   nil
  # end

  def dry_run
    reset_counters!
    fetch_tabs().flat_map {|tab| process_tab(tab) }
  end

  def stats
    {
      matcher: @matcher.stats,
      syncer: @syncer.stats,
      processors_stats: processors.map(&:stats)
    }
  end

  private
  def reset_counters!
    @processors = []
  end

  def fetch_tabs
    @fetcher.get_tabs_from_sheet(@sheet_id)
  end

  def source_json
    {
      class_name: self.class.name,
      sheet_id: @sheet_id
    }
  end

  # def sync!(records)
  #   records_within_scope = EventNote.where(source_json: source_json)
  #   @syncer.sync_and_delete_unmarked!(records, records_within_scope)
  #   log "stats.to_json: #{stats.to_json}"
  #   nil
  # end

  # process all tabs, each with their own processor
  def process_tab(tab)
    processor = GenericSurveyProcessor.new(log: @log) do |row|
      process_row_or_nil(row)
    end
    @processors << processor
    processor.dry_run(tab.tab_csv)
  end

  # Map `row` into `EventNote` attributes
  def process_row_or_nil(row)
    # student
    student_id = @matcher.find_student_id(row['LASID'])
    return nil if student_id.nil?

    # educator
    educator_id = @matcher.find_educator_id(row['recorded_by eduator_login'])
    return nil if educator_id.nil?

    # timestamp from form, or import time
    form_timestamp = @matcher.parse_sheets_est_timestamp(row['Timestamp']) || @time_now
    return nil if form_timestamp.nil?

    # whitelist prompts and responses
    prompt_keys = row.to_h.keys.select do |column_text|
      column_text.starts_with?('Q: ') && !column_text.downcase.include?('restricted')
    end
    text = prompt_keys.map {|key| [key, row[key]].join("\n") }.join("\n\n")

    {
      student_id: student_id,
      educator_id: educator_id,
      form_timestamp: form_timestamp,
      is_restricted: false,
      text: text,
      source_json: source_json
    }
  end
end
