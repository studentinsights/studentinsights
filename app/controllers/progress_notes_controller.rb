class ProgressNotesController < ApplicationController

  def create
    @progress_note = ProgressNote.new(progress_note_params)
    @progress_note.save
    respond_to :js
  end

  def progress_note_params
    params.require(:progress_note).permit(
      :intervention_id,
      :educator_id,
      :content
    )
  end

end
