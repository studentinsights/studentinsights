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
      :event_note_type_id,
      :from_time,
      :limit
    ]))
    
    event_note_cards_json, all_results_size = SearchNotesQueries.new(current_educator).event_note_cards_json(query)
    render json: {
      query: query,
      event_note_cards: event_note_cards_json,
      meta: {
        returned_size: event_note_cards_json.size,
        all_results_size: all_results_size
      }
    }
  end

  private
  def query_from_safe_params(safe_params)
    {
      from_time: safe_params[:from_time] || Time.now,
      limit: safe_params[:limit] || 20,
      text: safe_params[:text] || nil,
      grade: safe_params[:grade] || nil,
      house: safe_params[:house] || nil,
      event_note_type_id: safe_params[:event_note_type_id] || nil,
      scope_key: safe_params[:scope_key] || SearchNotesQueries::SCOPE_ALL_STUDENTS
    }
  end

  def ensure_authorized!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_searching_notes')
  end
end
