class InterventionMigrationHelper < Struct.new :intervention, :educator_id

  INTERVENTION_TYPES_TO_SERVICE_TYPES = {
    20 => 511, # After-School Tutoring (ATP)
    21 => 502, # Attendance Officer
    22 => 503, # Attendance Contract
    23 => 504, # Behavior Contract
    24 => nil, # Behavior Plan
    25 => nil, # Boys & Girls Club
    26 => nil, # Classroom Academic Intervention
    27 => nil, # Classroom Behavior Intervention
    28 => 513, # Community Schools
    29 => 505, # Counseling: In-House
    30 => 506, # Counseling: Outside/Physician Referral
    31 => nil, # ER Referral (Mental Health)
    32 => 507, # Math Tutor
    33 => nil, # Mobile Crisis Referral
    34 => nil, # MTSS Referral
    35 => nil, # OT/PT Consult
    36 => nil, # Parent Communication
    37 => nil, # Parent Conference/Meeting
    39 => nil, # Peer Mediation
    40 => 507, # Reading Specialist
    41 => 507, # Reading Tutor
    42 => nil, # SST Referral
    43 => nil, # Weekly Call/Email Home
    44 => 514, # X Block Tutor
    45 => nil, # 51a Filing
    46 => nil, # Other
  }

  def migrate
    create_service
    create_event_note
  end

  def create_service
    intervention_type_id = intervention.intervention_type_id

    service_type_id = INTERVENTION_TYPES_TO_SERVICE_TYPES[intervention_type_id]

    return if service_type_id.nil?

    Service.create(
      student_id: intervention.student_id,
      recorded_by_educator_id: educator_id,
      service_type_id: service_type_id,
      recorded_at: intervention.created_at,
      date_started: intervention.start_date,
    )
  end

  def create_event_note
    text = "#{intervention.comment}\n\nGoal: #{intervention.goal}"

    EventNote.create(
      student_id: intervention.student_id,
      educator_id: educator_id,
      event_note_type_id: 304,
      text: text,
      recorded_at: intervention.created_at,
      is_restricted: true,
    )
  end

end
