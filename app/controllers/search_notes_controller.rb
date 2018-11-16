class SearchNotesController < ApplicationController
  before_action :ensure_authorized!

  # Assumes always sorting by descending time from a particular moment, limited
  # to what the caller asks for
  def query_json
    query = query_from_safe_params(params.permit(*[
      :text,
      :scope_key,
      :grade,
      :house,
      :event_note_type_ids,
      :time_now,
      :limit
    ]))
    
    event_notes_json = []
    render json: {
      query: query,
      notes: event_notes_json
    }
  end

  private
  def query_from_safe_params(safe_params)
    {
      time_now: safe_params.fetch(:time_now, Time.now),
      limit: safe_params.fetch(:limit, 20),
      grade: safe_params.fetch(:grade, nil),
      house: safe_params.fetch(:house, nil),
      event_note_type_ids: safe_params.fetch(:event_note_type_ids, EventNoteType.pluck(:id)),
      scope_key: safe_params.fetch(:scope_key, SearchNotesQueries::SCOPE_ALL_STUDENTS)
    }
  end

  def ensure_authorized!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_searching_notes')
  end
end
