# For syncing between a CSV snapshot and an Insights model, particularly
# for tracking and then removing records in Insights that have been removed
# in the CSV snapshot.
#
# Callers have to match the CSV row to an Insights record, and describe
# what Insights records are within the window or scope of the sync.
class RecordSyncer
  def initialize(options = {})
    @log = options.fetch(:log)
    @notification_tag = options.fetch(:notification_tag, 'default')
    @alert_tuning = options.fetch(:alert_tuning, AlertTuning.new(10, 0.10))
    @alert_on_stats = options.fetch(:alert_on_stats, [
      :passed_nil_record_count,
      :invalid_rows_count,
      :updated_rows_count,
      :created_rows_count,
      :destroyed_records_count
    ])

    @passed_nil_record_count = 0
    @invalid_rows_count = 0
    @unchanged_rows_count = 0
    @updated_rows_count = 0
    @created_rows_count = 0
    @destroyed_records_count = 0
    @total_sync_calls_count = 0
    @validation_failure_counts_by_field = {}
    @marked_ids = []

    # only allow one-time use
    @has_processed_unmarked_records = false
  end

  # Given a new or persisted record, with attributes updated in memory
  # based on the CSV, update it in the Insights database.
  # Also track that the Insights record still exists in the current CSV snapshot.
  def validate_mark_and_sync!(insights_record)
    raise 'already set has_processed_unmarked_records' if @has_processed_unmarked_records

    # Always count this
    @total_sync_calls_count += 1

    # Passed nil, something failed upstream
    if insights_record.nil?
      @passed_nil_record_count += 1
      return :nil
    end

    # This would fail the validation, so don't try to sync it.
    # If for some edge case reason this is an existing persisted record
    # (eg, maybe it was created once, then we changed the validations and now it
    # would be invalid).  By returning early and not marking it,
    # invalid records like this will get purged by `delete_unmarked_records!`
    if !insights_record.valid?
      @invalid_rows_count += 1
      insights_record.errors.messages.keys.each do |validation_key|
        @validation_failure_counts_by_field[validation_key] = 0 unless @validation_failure_counts_by_field.has_key?(validation_key)
        @validation_failure_counts_by_field[validation_key] += 1
      end
      return :invalid
    end

    # For each outcome below, mark the Insights records that match ones in the CSV,
    # so that afterward we can remove ones within the import
    # scope that don't (they've been removed from the CSV).
    # Nothing has changed, update or create
    if insights_record.persisted? && !insights_record.changed?
      @unchanged_rows_count += 1
      mark_insights_record(insights_record)
      return :unchanged
    elsif insights_record.persisted?
      @updated_rows_count += 1
      insights_record.save!
      mark_insights_record(insights_record)
      return :updated
    else
      @created_rows_count += 1
      insights_record.save!
      mark_insights_record(insights_record)
      return :created
    end
  end

  # Delete Insights records that are no longer in the CSV snapshot.
  # (eg, the record was deleted upstream).
  #
  # The caller has to describe what records are in scope of the import (eg,
  # particular schools, date ranges, etc.) and this returns the count of deleted records.
  def delete_unmarked_records!(records_within_import_scope)
    raise 'already set has_processed_unmarked_records' if @has_processed_unmarked_records

    log('delete_unmarked_records starting...')

    # This is slow, but intentionally runs validations, hooks, etc. on each record
    # individually to be conservative.
    process_unmarked_records!(records_within_import_scope) do |record, index|
      record.destroy!
      @destroyed_records_count += 1
    end

    log('delete_unmarked_records done.')
    @destroyed_records_count
  end

  # Do something to each Insights record that is no longer in the CSV snapshot.
  # The caller has to describe what records they expected to be in scope of the import (eg,
  # particular schools, date ranges, etc.).  Returns the count of processed records.
  def process_unmarked_records!(records_within_import_scope, &block)
    raise 'already set has_processed_unmarked_records' if @has_processed_unmarked_records

    log("process_unmarked_records starting...")
    log("  records_within_import_scope.size: #{records_within_import_scope.size} in Insights")
    log("  @marked_ids.size = #{@marked_ids.size} from this import")

    unmarked_ids = records_within_import_scope.pluck(:id) - @marked_ids
    log("  unmarked_ids: #{unmarked_ids.inspect}") if unmarked_ids.size < 10

    records_to_process = records_within_import_scope.where(id: unmarked_ids)
    log("  records_to_process.size: #{records_to_process.size} within scope")

    records_to_process.each_with_index do |record, index|
      block.call(record, index)
      log("  processed #{index} rows.") if index > 0 && index % 100 == 0
    end

    log('  checking if stats seem outside expected bounds...')
    alerts = determine_alerts_after_processing
    if alerts.size > 0
      notify!(alerts)
    end

    # Set this to only allow calling in proper order, and only allow
    # one-time use.
    @has_processed_unmarked_records = true
    log("process_unmarked_records done.")
    records_to_process.size
  end

  # This has to be called after `process_unmarked_records!`
  def process_marked_records!(&block)
    raise 'already set has_processed_unmarked_records' unless @has_processed_unmarked_records

    log('process_marked_records! starting...')
    block.call(@marked_ids)
    log('process_marked_records! done.')
    @marked_ids.size
  end

  # For debugging and testing - total counts for instance lifetime
  def stats
    {
      total_sync_calls_count: @total_sync_calls_count,
      passed_nil_record_count: @passed_nil_record_count,
      invalid_rows_count: @invalid_rows_count,
      validation_failure_counts_by_field: @validation_failure_counts_by_field,
      updated_rows_count: @updated_rows_count,
      created_rows_count: @created_rows_count,
      destroyed_records_count: @destroyed_records_count,
      unchanged_rows_count: @unchanged_rows_count,
      has_processed_unmarked_records: @has_processed_unmarked_records,
      marked_ids_count: @marked_ids.size
    }
  end

  # For tuning alerts
  class AlertTuning
    def initialize(count_threshold, percentage_threshold)
      @count_threshold = count_threshold
      @percentage_threshold = percentage_threshold
    end

    def should_alert?(key, count, percentage)
      count > @count_threshold && percentage > @percentage_threshold
    end
  end

  private
  # Alert if any of these counts are strange
  def determine_alerts_after_processing
    alerts = []

    # Check each stat
    # :passed_nil_record_count,
    # :invalid_rows_count,
    # :updated_rows_count,
    # :created_rows_count,
    # :destroyed_records_count
    computed_stats = stats
    @alert_on_stats.each do |key|
      count = computed_stats[key]
      next if count == 0

      #percentage of record sync calls isn't meaningful for destroyed records
      percentage = (key == "destroyed_records_count")? "N/A" : (count.to_f / @total_sync_calls_count)
      next unless @alert_tuning.should_alert?(key, count, percentage)

      alerts << {
        rollbar_safelist_alert_key: key,
        rollbar_safelist_alert_count: count,
        rollbar_safelist_alert_percentage: percentage
      }
    end

    alerts
  end

  def notify!(alerts)
    # log
    district_key = PerDistrict.new.district_key
    log("  notifying about alerts=#{alerts.size} in district_key=#{district_key} for notification_tag=#{@notification_tag}")

    # report, splitting message name so that district_key and notification_tag
    # create distinct Rollbar issues
    msg = "RecordSyncer#notify! in #{district_key} for #{@notification_tag}"
    Rollbar.error(msg, nil, {
      rollbar_safelist_alerts: alerts,
      rollbar_safelist_caller: caller
    })
  end

  # Mark which Insights records match a row in the CSV.
  # We'll delete the ones that don't (with the scope of the import) afterward.
  def mark_insights_record(insights_record)
    @marked_ids << insights_record.id
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "RecordSyncer: #{text}"
  end
end
