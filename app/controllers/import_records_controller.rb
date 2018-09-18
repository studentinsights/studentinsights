class ImportRecordsController < ApplicationController
  before_action :ensure_authorized!
  include ActionView::Helpers::DateHelper

  def import_records_json
    recent_records = ImportRecord.order(created_at: :desc).take(25)
    import_records = recent_records.map { |record| import_record_for_page(record) }

    return render json: {
      import_records: import_records,
      queued_jobs: Delayed::Job.all
    }
  end

  private
  def ensure_authorized!
    raise Exceptions::EducatorNotAuthorized unless current_educator.can_set_districtwide_access?
  end

  def import_record_for_page(import_record)
    if import_record.completed?
      {
        id: import_record.id,
        completed: true,
        time_to_complete: import_record.time_to_complete,
        time_to_complete_in_words: distance_of_time_in_words(import_record.time_to_complete),
        time_started_display: import_record.time_started_display,
        time_ended_display: import_record.time_ended_display,
        importer_timing_json: import_record.importer_timing_json,
        task_options_json: import_record.task_options_json,
        log: import_record.log,
      }
    else
      {
        id: import_record.id,
        completed: false,
        time_started_display: import_record.time_started_display,
        importer_timing_json: import_record.importer_timing_json,
        task_options_json: import_record.task_options_json,
        log: import_record.log,
      }
    end
  end

end
