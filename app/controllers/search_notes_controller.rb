class SearchNotesController < ApplicationController
  before_action :ensure_authorized!

  # Assumes always sorting by descending time from a particular moment, limited
  # to what the caller asks for
  def query_json
    query = query_from_safe_params(params.permit(*[
      :start_time,
      :end_time,
      :limit,
      :scope_key,
      :text,
      :grade,
      :house,
      :event_note_type_id
    ]))

    results = SearchNotesQueries.new(current_educator).query(query)
    event_note_cards_json, all_results_size, query_with_defaults = results
    render json: {
      query: query_with_defaults,
      event_note_cards: event_note_cards_json,
      meta: {
        returned_size: event_note_cards_json.size,
        all_results_size: all_results_size
      }
    }
  end

  private
  # Defaults are set in the query class
  def query_from_safe_params(safe_params)
    {
      start_time: Time.at(safe_params[:start_time].to_i),
      end_time: Time.at(safe_params[:end_time].to_i),
      limit: safe_params[:limit].to_i,
      scope_key: safe_params[:scope_key],
      text: safe_params[:text],
      grade: safe_params[:grade],
      house: safe_params[:house],
      event_note_type_id: safe_params[:event_note_type_id],
    }
  end

  def ensure_authorized!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_searching_notes')
  end
end
