class StudentNotesController < ApplicationController
  include SerializeDataHelper

  def create
    student_note = StudentNote.new(student_note_params)
    student_note.educator = current_educator
    if student_note.save
      render json: serialize_student_note(student_note)
    else
      render json: { errors: student_note.errors.full_messages }, status: 422
    end
  end

  def student_note_params
    params.require(:student_note).permit(:student_id, :content)
  end

end
