# typed: true
# This is only for legacy reads; see `SecondTransitionNote` instead.
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
end
