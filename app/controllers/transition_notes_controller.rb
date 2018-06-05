class TransitionNotesController < ApplicationController
  before_action :authorize!

  def authorize!
    student = Student.find(params[:student_id])
    raise 'Student IDs don\'t match' if params[:student_id].to_i != transition_note_params[:student_id].to_i
    educator = current_educator
    raise Exceptions::EducatorNotAuthorized unless educator && educator.is_authorized_for_student(student)
    raise Exceptions::EducatorNotAuthorized unless educator && educator.labels.include?('k8_counselor')
  end

  def update
    is_restricted = transition_note_params[:is_restricted]
    student_id = transition_note_params[:student_id]

    transition_note = TransitionNote.find_or_initialize_by(
      is_restricted: is_restricted,
      student_id: student_id
    )

    if transition_note.update(text: transition_note_params[:text])
      render json: { result: 'ok' }
    else
      render json: { errors: transition_note.errors.full_messages }, status: 422
    end
  end

  private

    def transition_note_params
      params.require(:transition_note).require(
        :student_id,
        :text,
        :is_restricted,
      )
    end

end
