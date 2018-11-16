class SearchNotesController < ApplicationController
  before_action :ensure_authorized!

  def query_json
    safe_params = params.permit(:text, :event_note_type_ids, :grade, :house, :student_scope_key)

    event_notes_json = []
    render json: {
      query: safe_params,
      notes: event_notes_json
    }
  end

  private
  def ensure_authorized!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_searching_notes')
  end
end
