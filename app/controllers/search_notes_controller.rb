class SearchNotesController < ApplicationController
  before_action :ensure_authorized!

  # Assumes always sorting by descending time from a particular moment, limited
  # to what the caller asks for
  def query_json
    query = query_from_safe_params(params.permit(*[
      :text,
      :student_scope_key,
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
      grade: safe_params.fetch(:grade, SearchNoteQueries::ALL),
      house: safe_params.fetch(:house, SearchNoteQueries::ALL),
      event_note_type_ids: safe_params.fetch(:event_note_type_ids, SearchNoteQueries::ALL),
      student_scope_key: safe_params.fetch(:student_scope_key, SearchNoteQueries::ALL)
    }
  end

  def ensure_authorized!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_searching_notes')
  end
end
