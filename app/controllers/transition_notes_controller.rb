class TransitionNotesController < ApplicationController
  def restricted_transition_note_json
    safe_params = params.permit(:student_id)
    transition_note = authorized_or_raise! do
      TransitionNote.find_by({
        is_restricted: true,
        student_id: safe_params[:student_id]
      })
    end
    raise Exceptions::EducatorNotAuthorized unless transition_note.is_restricted

    json = transition_note.as_json({
      dangerously_include_restricted_note_text: true,
      only: [:text]
    })
    render json: json
  end

  # post
  def update
    raise Exceptions::EducatorNotAuthorized unless authorizer.is_authorized_to_write_transition_notes?

    safe_params = params.permit(:student_id, :is_restricted, :text)
    transition_note = authorized_or_raise! do
      TransitionNote.find_or_initialize_by({
        is_restricted: safe_is_restricted_value_for_update(safe_params),
        student_id: safe_params[:student_id]
      })
    end

    if transition_note.update({
      text: safe_params[:text],
      educator_id: current_educator.id
    })
      render json: { result: 'ok' }
    else
      render json: { errors: transition_note.errors.full_messages }, status: 422
    end
  end

  private
  # Guard what values can be set by the current educator
  def safe_is_restricted_value_for_update(safe_params)
    if current_educator.can_view_restricted_notes?
      safe_params[:is_restricted]
    else
      false
    end
  end
end
