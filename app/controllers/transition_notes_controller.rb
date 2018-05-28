class TransitionNotesController < ApplicationController
  before_action :authorize!

  def authorize!
    student = Student.find(params[:student_id])
    educator = current_educator
    raise Exceptions::EducatorNotAuthorized unless educator && educator.is_authorized_for_student(student)
  end

  def create
    transition_note = TransitionNote.new(transition_note_params.merge({
      educator_id: current_educator.id,
      recorded_at: Time.now
    }))

    if transition_note.save
      render json: 'ok'
    else
      render json: { errors: transition_note.errors.full_messages }, status: 422
    end
  end

  def update
    transition_note = TransitionNote.find_by_id(params[:id])

    transition_note.text = transition_note_params[:text]

    if transition_note.save
      render json: 'ok'
    else
      render json: { errors: transition_note.errors.full_messages }, status: 422
    end
  end

  private

    def transition_note_params
      params.require(:transition_note).permit(
        :student_id,
        :text,
        :is_restricted,
      )
    end

end
