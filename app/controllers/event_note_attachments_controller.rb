class EventNoteAttachmentsController < ApplicationController
  before_action :authorize!

  def authorize!
    student = EventNoteAttachment.find(params[:id]).try(:event_note).try(:student)
    raise Exceptions::EducatorNotAuthorized if student.nil?

    educator = current_educator
    raise Exceptions::EducatorNotAuthorized unless educator.is_authorized_for_student(student)
  end

  def destroy
    event_note_attachment = EventNoteAttachment.find(params[:id])
    if event_note_attachment.destroy
      render json: {}
    else
      render json: e
    end
  end
end
