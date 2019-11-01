class SearchNotesController < ApplicationController
  before_action :ensure_authorized!

  # Assumes always sorting by descending time from a particular moment, limited
  # to what the caller asks for
  def query_json
    query = query_from_safe_params(params.permit(*[
      :start_time_utc,
      :end_time_utc,
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

  def notes_patterns_json
    # notes for this school year, for students they work with
    time_now = Time.now
    school_year = SchoolYear.to_school_year(time_now)
    start_of_school_year = SchoolYear.first_day_of_school_for_year(school_year)
    students = authorizer.authorized { Student.active.to_a }
    event_notes = authorizer.authorized do
      EventNote
        .where(student: students.map(&:id))
        .where(is_restricted: false)
        .where('recorded_at >= ?', start_of_school_year)
    end

    # by student, flatten out and segment text
    notes_by_student_id = event_notes.group_by(&:student_id)
    segments_by_student_id = {}
    notes_by_student_id.each do |student_id, event_notes|
      note_texts = event_notes.map(&:text)
      segments = note_texts.flat_map do |text|
        PragmaticSegmenter::Segmenter.new(text: text, language: 'en').segment
      end
      segments_by_student_id[student_id] = segments
    end

    render json: {
      students: students.as_json(only: [:id, :first_name, :last_name, :grade, :house]),
      segments_by_student_id: segments_by_student_id
    }
  end

  private
  # Defaults are set in the query class
  def query_from_safe_params(safe_params)
    {
      start_time_utc: Time.at(safe_params[:start_time_utc].to_i),
      end_time_utc: Time.at(safe_params[:end_time_utc].to_i),
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
