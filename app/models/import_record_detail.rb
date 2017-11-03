class ImportRecordDetail < ActiveRecord::Base
  # Model to record the detail of a run of a specific FileImport
  # (e.g. CoursesSectionsImporter).
  #
  # Captures the following info about the run of the importer:
  #   - :import_record_id   (id of the related import_record)
  #   - :importer           (class name of the file_importer for this record)
  #   - :time_started       (time the import started)
  #   - :time_ended         (time the importer ended,
  #                          should be set with most failures as well)
  #   - :status             (current status of the importer: pending, started, failed,
  #                         completed. this is updated int the database when the status changes)
  #   - :error_message      (if a failure was detected,
  #                          this should contain the error message)
  #   - :rows_processed     (#of rows that import_row was called on.)
  #   - :rows_excluded      (#of rows excluded by the school fiter primarily)
  #                         (the sum of rows_processed and rows_excluded should
  #                         equal the number of lines in the CSV file)
  #   - :rows_created       (#of processed rows resulting in a new record in the database)
  #   - :rows_updated       (#of processed rows resulting in an updated record in the database)
  #   - :rows_deleted       (#of rows deleted from the database.
  #                         Currently used by StudentSectionAssignments and
  #                         EducatorSectionAssignments for stale assignments)
  #   - :rows_rejected      (#of processed rows that are rejected. For example, an
  #                         EducatorSectionAssignment where the Educator or Section doesn't exist in the database)
  #
  # There are four states:
  #   - Pending: persisted to db on creation (sets row_counts to 0)
  #   - Started: persisted to db on calling start (updates :time_started)
  #   - Completed: persisted to db on calling complete
  #               (updates :time_ended and all row counts)
  #   - Failed: persisted to db on calling fail
  #              (updates :time_ended, row counts, and :error_message)
  #
  #

  belongs_to :import_record

  after_create :init_defaults

  attr_accessor :logger

  def init_defaults
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
