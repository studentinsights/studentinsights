class ProgressNotesController < ApplicationController
  include SerializeDataHelper

  # Authentication by default inherited from ApplicationController.

  def create
    progress_note = ProgressNote.new(progress_note_params)

    if progress_note.save
      render json: serialize_progress_note(progress_note)
    else
      render json: { errors: progress_note.errors.full_messages }, status: 422
    end
  end

  def progress_note_params
    params.require(:progress_note).permit(
      :intervention_id,
      :educator_id,
      :content
    )
  end
end
