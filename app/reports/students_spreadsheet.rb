require 'csv'

class StudentsSpreadsheet
  # Creates a string of a flat CSV representing fields of
  # all students provided.
  def csv_string(students, school)
    return '' if students.size == 0

    all_service_types = ServiceType.all
    row_hashes = students.map do |student|
      flat_row_hash(student, all_service_types, school)
    end

    header_row = row_hashes.first.keys # all rows should have the same shape
    body_rows = row_hashes.map {|row_hash| row_hash.values }
    ([header_row] + body_rows).map {|row| row.to_csv }.join('')
  end

  private
  # Returns a flat hash with no nesting, using string keys that can be translated
  # to a CSV.
  # All students should have the same fields, so for concepts like "active services",
  # the hash should included keys for all fields, even if the student doesn't
  # have them.  In other words, this method is responsible for returning
  # the same shape for all students it is provided.
  def flat_row_hash(student, all_service_types, school)
    if school.school_type === "HS" then
      student_fields = student.as_json.except(*[
        'created_at',
        'updated_at',
        'student_address',
        'hispanic_latino',
        'race'
      ])
    else
      student_fields = student.as_json.except(*[
        'created_at',
        'updated_at',
        'student_address',
        'hispanic_latino',
        'race',
        'counselor',
        'house'
      ])
    end

    additional_student_fields = {
      student_risk_level: student.student_risk_level.level,
      discipline_incidents_count: student.most_recent_school_year_discipline_incidents_count,
      absences_count: student.most_recent_school_year_absences_count,
      tardies_count: student.most_recent_school_year_tardies_count,
      homeroom_name: student.try(:homeroom).try(:name)
    }

    # unroll all service types
    student_service_type_ids = student.services.active.map(&:service_type_id)
    service_fields = all_service_types.reduce({}) do |hash, service_type|
      service = student.services.active.find {|service| service.service_type_id == service_type.id }
      value = if service.nil? then '' else service.date_started.strftime("%Y-%m-%d") end
      hash["#{service_type.name} (active_service_date_started)"] = value
      hash
    end

    # Unroll all event note types.
    # This will include the presence of restricted notes, but only the date and
    # no content.
    all_event_note_types = EventNoteType.all
    event_note_type_ids = student.event_notes.map(&:event_note_type_id)
    event_note_fields = all_event_note_types.reduce({}) do |hash, event_note_type|
      event_note = student.event_notes.find {|event_note| event_note.event_note_type_id == event_note_type.id }
      value = if event_note.nil? then '' else event_note.recorded_at.strftime("%Y-%m-%d") end
      hash["#{event_note_type.name} (last_event_note_recorded_at)"] = value
      hash
    end

    student_fields
      .merge(additional_student_fields)
      .merge(service_fields)
      .merge(event_note_fields)
      .stringify_keys!
  end
end
