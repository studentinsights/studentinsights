require 'csv'

# Creates a string of a flat CSV representing fields of
# all students provided.  Intended for district admin and enforces authorization scope,
# since sensitive fields that are not normally exposed are included (eg, student address).
class WideStudentsExporter
  def initialize(educator, options = {})
    @authorizer = Authorizer.new(educator)
    @all_service_types = options.fetch(:all_service_types, ServiceType.all)
    @options = options
  end

  def csv_string(unsafe_students)
    students = @authorizer.authorized { unsafe_students.to_a }
    return '' if students.size == 0

    row_hashes = students.map {|student| flat_row_hash(student) }

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
  def flat_row_hash(student)
    # Remove some fields by default, these are likely to be misleading.
    # Allow callers to remove other fields (eg, address) for other uses,
    # to safelist with `only` instead.
    as_json_options = @options.fetch(:as_json_options, {
      except: [:created_at, :updated_at]
    })
    student_fields = student.as_json(as_json_options)

    # optionalin include other fields
    student_fields
      .merge(additional_student_fields(student))
      .merge(service_fields(student))
      .merge(event_note_fields(student))
      .stringify_keys!
  end

  def additional_student_fields(student)
    return {} unless @options.fetch(:include_additional_fields, false)

    {
      discipline_incidents_count: student.most_recent_school_year_discipline_incidents_count,
      absences_count: student.most_recent_school_year_absences_count,
      tardies_count: student.most_recent_school_year_tardies_count,
      homeroom_name: student.try(:homeroom).try(:name)
    }
  end

  # unroll all service types
  def service_fields(student)
    return {} unless @options.fetch(:include_services, false)

    @all_service_types.reduce({}) do |hash, service_type|
      service = student.services.active.find {|s| s.service_type_id == service_type.id }
      value = if service.nil? then '' else service.date_started.strftime("%Y-%m-%d") end
      hash["#{service_type.name} (active_service_date_started)"] = value
      hash
    end
  end

  # Unroll all event note types.
  # This will include the presence of restricted notes, but only the date and
  # no content.
  def event_note_fields(student)
    return {} unless @options.fetch(:include_event_notes, false)

    all_event_note_types = EventNoteType.all
    all_event_note_types.reduce({}) do |hash, event_note_type|
      event_note = student.event_notes.find {|e| e.event_note_type_id == event_note_type.id }
      value = if event_note.nil? then '' else event_note.recorded_at.strftime("%Y-%m-%d") end
      hash["#{event_note_type.name} (last_event_note_recorded_at)"] = value
      hash
    end
  end
end
