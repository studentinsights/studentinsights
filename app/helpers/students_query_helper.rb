require 'digest'

module StudentsQueryHelper
  INCLUDE_FOR_STUDENTS = Student.column_names.map(&:to_sym) - [
    :primary_phone,
    :primary_email,
    :student_address,
    :risk_level  # Hacky fix for risk level not clearing from column names
                 # cache after deploying https://github.com/studentinsights/studentinsights/pull/1892.
  ]

  # include notes that are is_restricted, but without their content
  INCLUDE_FOR_EVENT_NOTES = [
    :id,
    :student_id,
    :educator_id,
    :event_note_type_id,
    :recorded_at,
    :is_restricted,
  ]

  # Used to serializes a Student into a hash with other fields joined in (that are used to perform
  # filtering and slicing in the UI).
  # This may be slow if you're doing it for many students without eager includes.
  def student_hash_for_slicing(student)
    student_fields = Student.where(id: student.id).select(INCLUDE_FOR_STUDENTS)

    HashWithIndifferentAccess.new(
      student_fields.first.as_json.merge({
        discipline_incidents_count: student.most_recent_school_year_discipline_incidents_count,
        absences_count: student.most_recent_school_year_absences_count,
        tardies_count: student.most_recent_school_year_tardies_count,
        homeroom_name: student.try(:homeroom).try(:name)
      })
    )
  end

  # Queries for Services and EventNotes for each student, and merges the results
  # into the list of student hashes.
  def merge_mutable_fields_for_slicing(student_hashes)
    student_ids = student_hashes.map {|student_hash| student_hash[:id] }
    mutable_fields = mutable_fields_for_slicing(student_ids)

    student_hashes.map do |student_hash|
      for_student = {
        event_notes: mutable_fields[:all_event_notes].select {|event_note| event_note.student_id == student_hash[:id] },
        active_services: mutable_fields[:all_active_services].select {|service| service.student_id == student_hash[:id] },
        summer_services: mutable_fields[:all_summer_services].select {|service| service.student_id == student_hash[:id] },
        interventions: mutable_fields[:all_interventions].select {|intervention| intervention.student_id == student_hash[:id] }
      }
      student_hash.merge({
        event_notes: for_student[:event_notes].map {|x| EventNoteSerializer.new(x).serialize_for_school_overview },
        active_services: for_student[:active_services].map {|x| ServiceSerializer.new(x).serialize_service },
        summer_services: for_student[:summer_services].map {|x| ServiceSerializer.new(x).serialize_service },
        interventions: for_student[:interventions].map {|x| DeprecatedInterventionSerializer.new(x).serialize_intervention },
      })
    end
  end

  def mutable_fields_for_slicing(student_ids)
    summer_service_type_ids = ServiceType.where(summer_program: true).pluck(:id)
    {
      all_event_notes: EventNote.where(student_id: student_ids).select(INCLUDE_FOR_EVENT_NOTES),
      all_active_services: Service.where(student_id: student_ids).active,
      all_interventions: Intervention.where(student_id: student_ids),
      all_summer_services: Service.where(student_id: student_ids)
                                   .where(service_type_id: summer_service_type_ids)
                                   .where("date_started > ?", 1.year.ago)
    }
  end

end
