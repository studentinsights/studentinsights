def Syncer
  def initialize(options = {})
    @log = options.fetch(:log)

    @passed_nil_record_count = 0
    @invalid_rows_count = 0
    @unchanged_rows_count = 0
    @updated_rows_count = 0
    @created_rows_count = 0

    @marked_ids_by_class = []
  end

  def validate_mark_and_sync!(insights_record)
    # Passed nil, something failed upstream
    if insights_record.nil?
      @passed_nil_record_count = @passed_nil_record_count + 1
      return
    end

    # This would fail the validation, so don't try to sync it.
    # If for some edge case reason this is an existing persisted record
    # (eg, maybe it was created once, then we changed the validations and now it
    # would be invalid).  By returning early and not marking it,
    # invalid records like this will get purged by `delete_unmarked_records!`
    if !insights_record.valid?
      @invalid_rows_count = @invalid_rows_count + 1
      return
    end

    # Mark that this insights record matches one in the CSV,
    # so that afterward we can remove ones within the import
    # scope that don't (they've been removed from the CSV).
    mark_insights_record(insights_record)

    # See if anything has changed
    if !insights_record.changed?
      @unchanged_rows_count = @unchanged_rows_count + 1
      return
    end

    # Save, tracking if it's an update or create
    if insights_record.persisted?
      @updated_rows_count = @updated_rows_count + 1
    else
      @created_rows_count = @created_rows_count + 1
    end
    insights_record.save!
  end

  # Mark which Insights records match a row in the CSV.
  # We'll delete the ones that don't (with the scope of the import) afterward.
  def mark_insights_record(insights_record)
    @marked_ids_by_class << insights_record.id
  end

  # Delete Insights records that none of the CSV rows matched (ie, because the
  # record was deleted upstream).
  #
  # The caller has to describe what records are in scope of the import (eg,
  # particular schools, date ranges, etc.)
  def delete_unmarked_records!(records_within_import_scope)
    log("delete_unmarked_records")
    log("  records_within_import_scope.size: #{records_within_import_scope.size} in Insights")

    log("  @marked_ids_by_class.size = #{@marked_ids_by_class.size} from this import")
    unmarked_ids = records_within_import_scope.pluck(:id) - @marked_ids_by_class

    log("  destroying unmarked_ids.size: #{unmarked_ids.size} within scope")
    log("  unmarked_ids: #{unmarked_ids.inspect}") if unmarked_ids.size < 10
    records_within_import_scope.destroy_all!
    nil
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "Syncer: #{text}"
  end
end
