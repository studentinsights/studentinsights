class ImportRecordDetail < ActiveRecord::Base
  belongs_to :import_record

  after_initialize :init

  attr_accessor :logger

  def init
    update_attributes(
      :status => "Pending",
      :rows_processed => 0,
      :rows_excluded => 0,
      :rows_created => 0,
      :rows_updated => 0,
      :rows_deleted => 0,
      :rows_rejected => 0
    )
  end

  def start
    update_attributes(
      :time_started => DateTime.current,
      :status => "Started"
    )
  end

  def fail(error)
    update_attributes(
      :time_ended => DateTime.current,
      :status => "Failed",
      :error_message => error,
      :rows_processed => @processed_count
    )
  end

  def complete
    update_attributes(
      :time_ended => DateTime.current,
      :status => "Completed"
    )
  end

  def log_processed
    increment(:rows_processed)
  end

  def log_excluded
    increment(:rows_excluded)
  end

  def log_created
    increment(:rows_created)
  end

  def log_updated
    increment(:rows_updated)
  end

  def log_deleted(count)
    self[:rows_deleted] = count
  end

  def log_rejected(message=nil)
    increment(:rows_rejected)

    if message && logger
      logger.write(message)
    end
  end

  def log_action(record)
    if(record.new_record?)
      log_created
    elsif(record.changed?)
      log_updated
    end
  end

  def rows_summary
    {
      "processed": rows_processed,
      "excluded": rows_excluded,
      "created": rows_created,
      "updated": rows_updated,
      "deleted": rows_deleted,
      "rejected": rows_rejected
    }
  end
end
