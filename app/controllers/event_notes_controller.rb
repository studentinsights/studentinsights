class EventNotesController < ApplicationController
  include SerializeDataHelper

  rescue_from Exceptions::EducatorNotAuthorized, with: :redirect_unauthorized!

  before_action :authorize!, except: [:names] # TODO: Why is this here? :names is an action called on students only, right?

  def authorize!
    student = Student.find(params[:student_id])
    educator = current_educator
    raise Exceptions::EducatorNotAuthorized unless educator.is_authorized_for_student(student)
  end

  def create
    event_note = EventNote.new(event_note_params.merge({
      educator_id: current_educator.id,
      recorded_at: Time.now
    }))

    if event_note.save
      render json: serialize_event_note(event_note)
    else
      render json: { errors: event_note.errors.full_messages }, status: 422
    end
  end

  def update
    event_note_id = params[:id]

    event_note = EventNote.find(event_note_id)

    # Save the state of the existing event note.
    event_note_revision = build_revision(event_note)

    unless event_note_revision.save
      render json: { errors: event_note_revision.errors.full_messages }, status: 422
    end

    if event_note.update!(event_note_params)
      render json: serialize_event_note(event_note)
    else
      render json: { errors: event_note.errors.full_messages }, status: 422
    end
  end

  def destroy
    event_note_id = params[:id]

    event_note = EventNote.find(event_note_id)

    # Save the state of the existing event note.
    event_note_revision = build_revision(event_note)

    unless event_note_revision.save
      render json: { errors: event_note_revision.errors.full_messages }, status: 422
    end

    if event_note.destroy
      render json: serialize_event_note(event_note)
    else
      render json: { errors: event_note.errors.full_messages }, status: 422
    end
  end

  private
    def event_note_params
      params.require(:event_note).permit(
        :student_id,
        :event_note_type_id,
        :text,
        :is_restricted
      )
    end

    # Builds a revision of a given event note.
    def build_revision(event_note)
      previous_event_note_revision = EventNoteRevision.where(
        event_note_id: event_note.id
      ).order(
        :version
      ).last

      if previous_event_note_revision
        version = previous_event_note_revision.version + 1
      else
        version = 1
      end

      return EventNoteRevision.new({
        educator_id: event_note.educator_id,
        student_id: event_note.student_id,
        event_note_type_id: event_note.event_note_type_id,
        text: event_note.text,
        event_note_id: event_note.id,
        version: version
      })
    end

end
