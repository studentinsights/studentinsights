class TransitionNotesController < ApplicationController
  before_action :authorize!

  def authorize!
    student = Student.find(params[:student_id])
    educator = current_educator
    raise Exceptions::EducatorNotAuthorized unless educator && educator.is_authorized_for_student(student)
    raise Exceptions::EducatorNotAuthorized unless educator && educator.labels.include?('k8_counselor')
  end

  def update
    params.require(:is_restricted)
    params.require(:student_id)
    params.require(:text)

    is_restricted = params[:is_restricted]
    student_id = params[:student_id]
    text = params[:text]

    transition_note = TransitionNote.find_or_initialize_by(
      is_restricted: is_restricted,
      student_id: student_id
    )

    if transition_note.update(text: text, educator_id: current_educator.id)
      render json: { result: 'ok' }
    else
      render json: { errors: transition_note.errors.full_messages }, status: 422
    end
  end

end
