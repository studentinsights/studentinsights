class EventNotesController < ApplicationController
  def restricted_note_json
    safe_params = params.permit(:id)
    event_note = authorized_or_raise! { EventNote.find(safe_params[:id]) }
    raise Exceptions::EducatorNotAuthorized unless event_note.is_restricted

    json = event_note.as_json({
      dangerously_include_restricted_note_text: true,
      only: [:text],
      include: {
        event_note_attachments: {
          only: [:url]
        }
      }
    })
    render json: json
  end

  # post
  # for restricted or unrestricted notes
  def create
    safe_params = params.require(:event_note).permit(
      :student_id,
      :event_note_type_id,
      :text,
      :is_restricted,
      event_note_attachments_attributes: [:url]
    )
    authorized_or_raise! { Student.find(safe_params[:student_id]) }

    event_note = EventNote.new(safe_params.merge({
      is_restricted: safe_is_restricted_value_for_create(safe_params),
      educator_id: current_educator.id,
      recorded_at: Time.now
    }))

    if event_note.save
      serializer = EventNoteSerializer.dangerously_include_restricted_note_text(event_note)
      render json: serializer.serialize_event_note
    else
      render json: { errors: event_note.errors.full_messages }, status: 422
    end
  end

  # patch
  # restricted or unrestricted
  def update
    safe_params = params.permit(:id, :student_id, event_note: [:text])
    event_note = authorized_or_raise! { EventNote.find(safe_params[:id]) }

    # First store the current state of the existing event note
    event_note_revision = create_event_note_revision(event_note)
    unless event_note_revision
      return render json: { errors: event_note_revision.errors.full_messages }, status: 422
    end

    # Update the EventNote
    safe_params[:event_note]
    if event_note.update({
      text: safe_params[:event_note][:text],
      recorded_at: Time.now
    })
      serializer = EventNoteSerializer.dangerously_include_restricted_note_text(event_note)
      render json: serializer.serialize_event_note
    else
      render json: { errors: event_note.errors.full_messages }, status: 422
    end
  end

  # delete
  def destroy_attachment
    safe_params = params.permit(:event_note_attachment_id)
    id = safe_params[:event_note_attachment_id]
    event_note = authorized_or_raise! do
      EventNoteAttachment.find(id).try(:event_note)
    end
    event_note_attachment = event_note.event_note_attachments.find(id)
    if event_note_attachment.destroy
      render json: {}
    else
      render json: e
    end
  end

  private
  # Guard what values can be set by the current educator
  def safe_is_restricted_value_for_create(safe_params)
    if current_educator.can_view_restricted_notes?
      safe_params[:is_restricted]
    else
      false
    end
  end

  def create_event_note_revision(event_note)
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

    event_note_revision = EventNoteRevision.new({
      educator_id: event_note.educator_id,
      student_id: event_note.student_id,
      event_note_type_id: event_note.event_note_type_id,
      text: event_note.text,
      event_note_id: event_note.id,
      version: version
    })

    if event_note_revision.save
      event_note_revision
    else
      nil
    end
  end
end
