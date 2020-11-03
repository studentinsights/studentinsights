class ConnectionsController < ApplicationController
  before_action :ensure_feature_enabled_for_district!

  def show_json
    params.require(:school_id)
    params.permit(:time_now)
    time_now = time_now_or_param(params[:time_now])
    school_id = (School.find_by_slug(params[:school_id]) || School.find_by_id(params[:school_id])).id

    students_with_2020_survey_data_json = students_with_2020_survey_data(current_educator, school_id, time_now)
    render json: {
      students_with_2020_survey_data: students_with_2020_survey_data_json
    }
  end

  private
  # Use time from value or fall back to Time.now
  def time_now_or_param(params_time_now)
    if params_time_now.present?
      Time.at(params_time_now.to_i)
    else
      Time.now
    end
  end

  def ensure_feature_enabled_for_district!
    raise Exceptions::EducatorNotAuthorized unless PerDistrict.new.enabled_high_school_levels?
  end

  def students_with_2020_survey_data(educator, school_id, time_now)
    # query for students, enforce authorization
    students = Authorizer.new(educator).authorized do
      Student.active
        .where(school_id: school_id)

        # .to_a # because of AuthorizedDispatcher#filter_relation
    end
    unsafe_students_with_2020_survey_data_json(students, time_now)
  end

  # At present, similar to the data needed for the levels page, without the level
  # calculation itself. Inlcudes specific answer to 2020 survey
  # These queries have no auth checks, so authorization must be established when
  # getting the students list
  def unsafe_students_with_2020_survey_data_json(students, time_now)
    cutoff_time = time_now - 45.days

    # Only include relevant survey answer
    survey_responses = StudentVoiceCompleted2020Survey
      .where('created_at >= ?', cutoff_time)
      .select(:id, :student_id, :shs_adult)
      .group_by(&:student_id)

      puts "*****************"
      puts survey_responses
    student_ids = survey_responses.keys #Only students with completed surveys

    # query for absences and discipline events in batch
    absence_counts_by_student_id = Absence
      .where(student_id: student_ids)
      .where('occurred_at >= ?', cutoff_time)
      .group(:student_id)
      .count
    discipline_incident_counts_by_student_id = DisciplineIncident
      .where(student_id: student_ids)
      .where('occurred_at >= ?', cutoff_time)
      .group(:student_id)
      .count

    # query for sections within the current term
    section_ids = Section
      .where(term_local_id: SchoolYear.current_term_local_ids(time_now))
      .pluck(:id)
    student_section_assignments_by_student_id = StudentSectionAssignment
      .includes(section: :course)
      .where(student_id: student_ids)
      .where(section_id: section_ids)
      .group_by(&:student_id)

    # Optimized batch query for latest event_notes
    notes_by_student_id = most_recent_event_notes_by_student_id(student_ids, cutoff_time, notes_query_map)

    students_with_surveys = Student.where(id: student_ids)

    # Serialize student fields
    students_json = students_with_surveys.as_json(only: [
      :id,
      :first_name,
      :last_name,
      :grade,
      :limited_english_proficiency,
      :house,
      :counselor,
      :sped_placement,
      :program_assigned
    ])

    # Merge it all back together
    students_with_2020_survey_data = students_json.map do |student_json|
      student_id = student_json['id']
      student_section_assignments_right_now = student_section_assignments_by_student_id.fetch(student_id, [])
      student_json.merge({
        survey_response: survey_responses[student_id],
        absences_count_in_period: absence_counts_by_student_id.fetch(student_id, 0),
        discipline_incident_count_in_period: discipline_incident_counts_by_student_id.fetch(student_id, 0),
        section_assignments_right_now: student_section_assignments_by_student_id.fetch(student_id, []),
        notes: notes_by_student_id[student_id],
        student_section_assignments_right_now: student_section_assignments_right_now.as_json({
          only: [:id, :grade_letter, :grade_numeric],
          include: {
            section: {
              only: [:id, :section_number],
              methods: [:course_description]
            }
          }
        })
      })
    end
    puts students_with_2020_survey_data.as_json
    end

    def notes_query_map
    sst_event_note_type_ids = [300]
    experience_event_note_type_ids = [305, 306, 307]
    counselor_event_note_type_ids = [308]
    other_event_note_type_ids = EventNoteType.all.pluck(:id) - sst_event_note_type_ids - experience_event_note_type_ids
    {
      last_sst_note: sst_event_note_type_ids,
      last_experience_note: experience_event_note_type_ids,
      last_counselor_note: counselor_event_note_type_ids,
      last_other_note: other_event_note_type_ids
    }
  end

  # query_map is {:result_key => [event_note_type_id]}
  def most_recent_event_notes_by_student_id(student_ids, cutoff_time, query_map)
    notes_by_student_id = {}

    # query across all students and note types
    all_event_note_type_ids = query_map.values.flatten.uniq
    partial_event_notes = EventNote
      .where(student_id: student_ids)
      .where('recorded_at >= ?', cutoff_time)
      .where(event_note_type_id: all_event_note_type_ids)
      .where(is_restricted: false)
      .select('student_id, event_note_type_id, max(recorded_at) as most_recent_recorded_at')
      .group(:student_id, :event_note_type_id)

    # merge them together and serialize
    sorted_partial_event_notes = partial_event_notes.sort_by(&:most_recent_recorded_at).reverse
    student_ids.each do |student_id|
      notes_for_student = {}
      query_map.each do |key, event_note_type_ids|
        # find the most recent note for this kind, we can use find because the list is sorted
        matching_partial_note = sorted_partial_event_notes.find do |partial_event_note|
          matches_student_id = partial_event_note.student_id == student_id
          matches_event_note_type_id = event_note_type_ids.include?(partial_event_note.event_note_type_id)
          matches_student_id && matches_event_note_type_id
        end

        # serialize notes for a student
        if matching_partial_note.nil?
          notes_for_student[key] = {}
        else
          notes_for_student[key] = {
            event_note_type_id: matching_partial_note.event_note_type_id,
            recorded_at: matching_partial_note.most_recent_recorded_at
          }
        end
      end
      notes_by_student_id[student_id] = notes_for_student
    end
    notes_by_student_id
  end

end
