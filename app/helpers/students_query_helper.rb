require 'digest'

module StudentsQueryHelper
  # Used to serializes a Student into a hash with other fields joined in (that are used to perform
  # filtering and slicing in the UI).
  # This may be slow if you're doing it for many students without eager includes.
  def student_hash_for_slicing(student)
    HashWithIndifferentAccess.new(student.as_json.merge({
      discipline_incidents_count: student.most_recent_school_year_discipline_incidents_count,
      absences_count: student.most_recent_school_year_absences_count,
      tardies_count: student.most_recent_school_year_tardies_count,
      homeroom_name: student.try(:homeroom).try(:name)
    }))
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
        active_services: for_student[:active_services].map {|x| serialize_service(x) },
        summer_services: for_student[:summer_services].map {|x| serialize_service(x) },
        interventions: for_student[:interventions].map {|x| serialize_intervention(x) },
      })
    end
  end

  def mutable_fields_for_slicing(student_ids)
    summer_service_type_ids = ServiceType.where(summer_program: true).pluck(:id)
    {
      all_event_notes: EventNote.where(student_id: student_ids),
      all_active_services: Service.where(student_id: student_ids).active,
      all_interventions: Intervention.where(student_id: student_ids),
      all_summer_services: Service.where(student_id: student_ids)
                                   .where(service_type_id: summer_service_type_ids)
                                   .where("date_started > ?", 1.year.ago)
    }
  end

  # Computes a key for reading and writing precomputed student_hashes documents.
  #
  # The original formats to this key concatenated all student_ids but is deprecated and
  # no longer used (although it's still here since data still exists thats keyed like that).
  # That can be accessed with `force_deprecated_key`.
  #
  # The newer key strategy hashes the values that made up the old key so it's length is
  # capped.
  def precomputed_student_hashes_key(time_now, authorized_student_ids, options = {})
    timestamp = time_now.beginning_of_day.to_i
    authorized_students_key = authorized_student_ids.sort.join(',')
    if options[:force_deprecated_key]
      ['precomputed_student_hashes', timestamp, authorized_students_key].join('_')
    else
      ['short', timestamp, authorized_student_ids.size, Digest::SHA256.hexdigest(authorized_students_key)].join(':')
    end
  end
end
