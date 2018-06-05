class TransitionNotesController < ApplicationController
  before_action :authorize!

  def update
    params.require(:id) # student_id
    params.require(:text)
    params.require(:is_restricted)
    student_id = params[:id]
    is_restricted = params[:is_restricted]
    text = params[:text]

    transition_note = TransitionNote.find_or_initialize_by(
      is_restricted: is_restricted,
      student_id: student_id
    )

    if transition_note.update(text: text)
      render json: { result: 'ok' }
    else
      render json: { errors: transition_note.errors.full_messages }, status: 422
    end
  end

  private

    def authorize!
      student = Student.find(params[:id].to_i)
      puts "current_educator.is_authorized_for_student(student) #{current_educator.is_authorized_for_student(student)}"
      puts "current_educator.labels #{current_educator.labels}"
      raise Exceptions::EducatorNotAuthorized unless current_educator && current_educator.is_authorized_for_student(student)
      raise Exceptions::EducatorNotAuthorized unless current_educator && current_educator.labels.include?('k8_counselor')
    end

end
