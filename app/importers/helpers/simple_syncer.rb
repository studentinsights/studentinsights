# experimental
class SimpleSyncer
  def initialize(options = {})
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @syncer = options.fetch(:syncer, RecordSyncer.new(log: @log))
    @log_frequency = options.fetch(:log_frequency, 100)
  end

  # Use RecordSyncer and sync all we can, deleting any that are unmarked
  def sync_and_delete_unmarked!(records, records_within_scope)
    log('Starting sync loop...')
    records.each_with_index do |record, index|
      @syncer.validate_mark_and_sync!(record)
      log("synced #{index} rows.") if index % @log_frequency == 0
    end
    log('Done sync loop.')

    log('Calling #delete_unmarked_records...')
    @syncer.delete_unmarked_records!(records_within_scope)
    log("Syncing stats: #{@syncer.stats}")
    nil
  end

  def stats
    @syncer.stats
  end

  private
  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "SimpleSyncer: #{text}"
  end
end
