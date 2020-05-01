class EventNotesController < ApplicationController
  def restricted_note_json
    safe_params = params.permit(:id)
    event_note = authorized_or_raise! { EventNote.find(safe_params[:id]) }
    raise Exceptions::EducatorNotAuthorized unless event_note.is_restricted

    json = event_note.as_json({
      dangerously_include_restricted_text: true,
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
    # ignore draft_key param for now
    safe_params = params.require(:event_note).permit(
      :student_id,
      :event_note_type_id,
      :text,
      :is_restricted,
      event_note_attachments_attributes: [:url]
    )
    authorized_or_raise! { Student.find(safe_params[:student_id]) }

    event_note = EventNote.new(safe_params.merge({
      is_restricted: safe_is_restricted_value(safe_params[:is_restricted]),
      educator_id: current_educator.id,
      recorded_at: Time.now
    }))

    if event_note.save
      serializer = EventNoteSerializer.dangerously_include_restricted_text(event_note)
      render json: serializer.serialize_event_note
    else
      render json: { errors: event_note.errors.full_messages }, status: 422
    end
  end

  # patch
  # restricted or unrestricted
  # does not allow changing restricted status; see #mark_as_restricted
  def update
    safe_params = params.permit(:id, :student_id, event_note: [:text])
    event_note = authorized_or_raise! { EventNote.find(safe_params[:id]) }
    raise Exceptions::EducatorNotAuthorized unless event_note.educator_id == current_educator.id

    # Update and also store the revision history
    update_succeeded, event_note_revision = update_note_with_revision(event_note, :text, safe_params[:event_note][:text])

    # Error types
    if event_note_revision.nil?
      render json: { errors: event_note_revision.errors.full_messages }, status: 422
    elsif !update_succeeded
      render json: { errors: event_note.errors.full_messages }, status: 422
    else
      serializer = EventNoteSerializer.dangerously_include_restricted_text(event_note)
      render json: serializer.serialize_event_note
    end
  end

  # delete
  def destroy_attachment
    safe_params = params.permit(:event_note_attachment_id)
    id = safe_params[:event_note_attachment_id]
    event_note = authorized_or_raise! do
      EventNoteAttachment.find(id).try(:event_note)
    end
    raise Exceptions::EducatorNotAuthorized unless event_note.educator_id == current_educator.id

    event_note_attachment = event_note.event_note_attachments.find(id)
    if event_note_attachment.destroy
      render json: {}
    else
      render json: e
    end
  end

  # put
  def mark_as_restricted
    safe_params = params.permit(:id)
    event_note = authorized_or_raise! { EventNote.find(safe_params[:id]) }
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('can_mark_notes_as_restricted')
    return render json: {} if event_note.is_restricted # put is idempotent

    update_succeeded, event_note_revision = update_note_with_revision(event_note, :is_restricted, true)
    if event_note_revision.nil? || !update_succeeded
      render json: { errors: 'request failed' }, status: 422
    else
      render json: {}
    end
  end

  # PUT
  def event_note_draft_json
    safe_params = params.permit(:student_id, :draft_key, draft: [
      :event_note_type_id,
      :is_restricted,
      :text
    ])
    authorized_or_raise! { Student.find(safe_params[:student_id]) }

    EventNoteDraft.transaction do
      draft = EventNoteDraft.find_or_initialize_by({
        draft_key: safe_params[:draft_key],
        student_id: safe_params[:student_id],
        educator_id: current_educator.id
      })
      draft.update!({
        event_note_type_id: safe_params[:draft][:event_note_type_id],
        is_restricted: safe_is_restricted_value(safe_params[:draft][:is_restricted]),
        text: safe_params[:draft][:text],
        updated_at: Time.now
      })
    end
    render json: {}, status: 201
  end

  private
  # Guard what values can be set by the current educator
  def safe_is_restricted_value(unsafe_is_restricted)
    if current_educator.can_view_restricted_notes?
      unsafe_is_restricted
    else
      false
    end
  end

  # Update a single field on a note, storing revision history
  def update_note_with_revision(event_note, attr_key, attr_value)
    # First store the current state of the existing event note
    event_note_revision = create_event_note_revision(event_note)
    return [false, event_note_revision] if !event_note_revision

    # Update the EventNote, but don't update `recorded_at` - keep that at the original
    # recording time.  The assumption is that these "updates" are from from the user continually
    # editing during a meeting (the "start time" is fine) or from typo fixes (we don't care about
    # those).  Or they are from some meta change like "set this as restricted."
    update_succeeded = event_note.update(attr_key => attr_value)
    [update_succeeded, event_note_revision]
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
