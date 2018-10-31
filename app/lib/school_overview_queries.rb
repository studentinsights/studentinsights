class SchoolOverviewQueries
  # include notes that are is_restricted, but without their content
  INCLUDE_FOR_EVENT_NOTES = [
    :id,
    :student_id,
    :educator_id,
    :event_note_type_id,
    :recorded_at,
    :is_restricted,
  ]

  def initialize(options = {})
    @time_now = options.fetch(:time_now, Time.now)
    @force_querying_on_demand = options.fetch(:force_querying_on_demand, false)
  end

  def json_for_overview(educator, school)
    # Authorization
    authorizer = Authorizer.new(educator)
    authorized_student_ids = authorizer.authorized { school.students.active }.map(&:id)
    if authorized_student_ids.size == 0
      Rollbar.error("json_for_overview found 0 authorized students for educator_id: #{educator.id}")
    end

    # Get hashes about students, then merge in mutable data
    student_hashes = if @force_querying_on_demand
      compute_student_hashes(authorized_student_ids)
    else
      load_precomputed_student_hashes(educator, authorized_student_ids)
    end
    merged_student_hashes = merge_mutable_fields_for_slicing(student_hashes)

    # Return shape
    {
      students: merged_student_hashes,
      school: school,
      district_key: PerDistrict.new.district_key,
      current_educator: educator,
      constant_indexes: constant_indexes,
      force_querying_on_demand: @force_querying_on_demand
    }
  end

  # Also used for precomputing
  def compute_student_hashes(authorized_student_ids)
    # Students table first
    authorized_students = Student.where(id: authorized_student_ids).includes(:homeroom)
    students_json = authorized_students.as_json({
      except: [
        :primary_phone,
        :primary_email,
        :student_address
      ]
    })

    # Optimized computation for aggregates
    aggregates = {
      discipline_incidents_count: DisciplineIncident.where(student_id: authorized_student_ids).where('occurred_at >= ?', first_day_of_school).group(:student_id).count,
      absences_count: Absence.where(student_id: authorized_student_ids).where('occurred_at >= ?', first_day_of_school).group(:student_id).count,
      tardies_count: Tardy.where(student_id: authorized_student_ids).where('occurred_at >= ?', first_day_of_school).group(:student_id).count
    }

    # Merge
    authorized_students.each_with_index.map do |student, index|
      HashWithIndifferentAccess.new(students_json[index].merge({
        discipline_incidents_count: aggregates[:discipline_incidents_count].fetch(student.id, 0),
        absences_count: aggregates[:absences_count].fetch(student.id, 0),
        tardies_count: aggregates[:tardies_count].fetch(student.id, 0),
        homeroom_name: student.try(:homeroom).try(:name)
      }))
    end
  end

  private
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
        event_notes: for_student[:event_notes].map {|x| EventNoteSerializer.safe(x).serialize_for_school_overview },
        active_services: for_student[:active_services].map {|x| ServiceSerializer.new(x).serialize_service },
        summer_services: for_student[:summer_services].map {|x| ServiceSerializer.new(x).serialize_service },
        interventions: for_student[:interventions].map {|x| DeprecatedInterventionSerializer.new(x).serialize_intervention },
      })
    end
  end

  def mutable_fields_for_slicing(student_ids)
    summer_service_type_ids = ServiceType.where(summer_program: true).pluck(:id)
    {
      all_event_notes: EventNote.where(student_id: student_ids).select(INCLUDE_FOR_EVENT_NOTES).where('recorded_at > ?', first_day_of_school),
      all_active_services: Service.where(student_id: student_ids).active,
      all_interventions: Intervention.where(student_id: student_ids).includes(:intervention_type, :educator).where('start_date > ?', first_day_of_school),
      all_summer_services: Service.where(student_id: student_ids).where(service_type_id: summer_service_type_ids).where('date_started > ?', first_day_of_school)
    }
  end

  # This should always find a record, but if it doesn't we fall back to the
  # raw query.
  # Results an array of student_hashes.
  def load_precomputed_student_hashes(educator, authorized_student_ids)
    begin
      doc = PrecomputedQueryDoc.latest_precomputed_student_hashes_for(authorized_student_ids)
      return doc if doc.present?
    rescue ActiveRecord::StatementInvalid => err
      Rollbar.error("load_precomputed_student_hashes raised error for #{educator.id}", err)
    end

    # Fallback to performing the full query if something went wrong reading the
    # precomputed value, or the precomputed response couldn't be found.
    fallback_message = "falling back to full load_precomputed_student_hashes query for educator: #{educator.id}"
    Rollbar.error(fallback_message)
    compute_student_hashes(authorized_student_ids)
  end

  # Serialize what are essentially constants stored in the database down
  # to the UI so it can use them for joins.
  def constant_indexes
    {
      service_types_index: ServiceSerializer.service_types_index
    }
  end

  def first_day_of_school
    SchoolYear.first_day_of_school_for_time(@time_now)
  end
end
