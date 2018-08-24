class Api {

  saveNotes(studentId, eventNoteParams) {
    if (eventNoteParams.id) {
      return this._updateNote(studentId, eventNoteParams);
    }
    else {
      return this._createNote(studentId, eventNoteParams);
    }
  }

  _createNote(studentId, eventNoteParams) {
    return this._post('/api/event_notes', {
      event_note: {
        event_note_type_id: eventNoteParams.eventNoteTypeId,
        text: eventNoteParams.text,
        student_id: studentId,
        is_restricted: eventNoteParams.is_restricted || false,
        event_note_attachments_attributes: eventNoteParams.eventNoteAttachments
      }
    });
  }

  _updateNote(studentId, eventNoteParams) {
    const id = eventNoteParams.id;

    return this._patch(`/api/event_notes/${id}`, {
      event_note: {
        text: eventNoteParams.text
      }
    });
  }

  deleteEventNoteAttachment(eventNoteAttachmentId) {
    const url = `/event_notes/attachment/${eventNoteAttachmentId}`;
    return this._delete(url);
  }

  saveTransitionNote(studentId, noteParams) {
    return this._post('/students/' + studentId + '/update_transition_note', {
      text: noteParams.text,
      is_restricted: noteParams.is_restricted,
    });
  }

  saveService(studentId, serviceParams) {
    const url = '/students/' + studentId + '/service.json';
    const body = {
      service: {
        service_type_id: serviceParams.serviceTypeId,
        date_started: serviceParams.dateStartedText,
        estimated_end_date: serviceParams.estimatedEndDateText,
        provided_by_educator_name: serviceParams.providedByEducatorName,
        student_id: studentId
      }
    };

    return this._post(url, body);
  }

  discontinueService(serviceId) {
    const url = '/services/' + serviceId;
    return this._delete(url);
  }

  _post(url, body) {
    return $.ajax({
      url: url,
      method: 'POST',
      contentType: 'application/json; charset=UTF-8',
      dataType: 'json',
      data: JSON.stringify(body)
    });
  }

  _patch(url, body) {
    return $.ajax({
      url: url,
      method: 'PATCH',
      contentType: 'application/json; charset=UTF-8',
      dataType: 'json',
      data: JSON.stringify(body)
    });
  }

  _delete(url) {
    return $.ajax({
      url: url,
      method: 'DELETE'
    });
  }
}

export default Api;
